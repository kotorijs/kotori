import I18n from '@kotori-bot/i18n';
import { Context, EventsList, EventsMapping } from 'fluoro';
import type Api from './api';
import {
  EventDataApiBase,
  EventDataTargetId,
  MessageScope,
  MessageRaw,
  MessageQuick,
  AdapterConfig,
  CommandResult,
  SessionData
} from '../types';
import Elements from './elements';
import { cancelFactory, formatFactory } from '../utils/factory';
import CommandError from '../utils/commandError';
import { Symbols } from '../global';

type EventApiType = {
  [K in keyof EventsList]: EventsList[K] extends EventDataApiBase ? EventsList[K] : never;
};

interface AdapterStatus {
  value: 'online' | 'offline';
  createTime: Date;
  lastMsgTime: Date | null;
  receivedMsg: number;
  sentMsg: number;
  offlineTimes: number;
}

interface AdapterImpl<T extends Api = Api> {
  readonly ctx: Context;
  readonly config: AdapterConfig;
  readonly platform: string;
  readonly selfId: EventDataTargetId;
  readonly identity: string;
  readonly api: T;
  readonly elements: Elements;
  readonly status: AdapterStatus;
}

function setProxy<T extends Api>(api: Api, ctx: Context): T {
  const proxy = Object.create(api) as T;
  proxy.sendPrivateMsg = new Proxy(api.sendPrivateMsg, {
    apply(_, __, argArray) {
      const [message, targetId] = argArray;
      const cancel = cancelFactory();
      ctx.emit('before_send', { api, message, messageType: MessageScope.PRIVATE, targetId, cancel: cancel.get() });
      if (cancel.value) return;
      api.sendPrivateMsg(message, targetId, argArray[2]);
    }
  });
  proxy.sendGroupMsg = new Proxy(api.sendGroupMsg, {
    apply(_, __, argArray) {
      const [message, targetId] = argArray;
      const cancel = cancelFactory();
      ctx.emit('before_send', { api, message, messageType: MessageScope.PRIVATE, targetId, cancel: cancel.get() });
      if (cancel.value) return;
      api.sendGroupMsg(message, targetId, argArray[2]);
    }
  });
  return proxy;
}

function sendMessageFactory(adapter: Adapter, type: keyof EventApiType, data: Parameters<Adapter['session']>[1]) {
  if ((data.type === MessageScope.GROUP || type.includes('group')) && 'groupId' in data) {
    return (message: MessageRaw) => {
      adapter.api.sendGroupMsg(message, data.groupId as EventDataTargetId, data.extra);
    };
  }
  return (message: MessageRaw) => {
    adapter.api.sendPrivateMsg(message, data.userId, data.extra);
  };
}

function quickFactory(send: ReturnType<typeof sendMessageFactory>, i18n: I18n) {
  return async (message: MessageQuick) => {
    const msg = await message;
    if (!msg || msg instanceof CommandError) return;
    if (typeof msg === 'string') {
      send(i18n.locale(msg));
      return;
    }
    send(formatFactory(i18n)(...msg));
  };
}

function isSameSender(adapter: Adapter, data: Parameters<Adapter['session']>[1], session: SessionData) {
  return (
    session.api.adapter.identity === adapter.identity &&
    session.api.adapter.platform === adapter.platform &&
    session.type === data.type &&
    session.groupId === data.groupId &&
    session.userId === data.userId &&
    'messageId' in data &&
    session.messageId !== data.messageId
  );
}

function promptFactory(
  quick: ReturnType<typeof quickFactory>,
  adapter: Adapter,
  data: Parameters<Adapter['session']>[1]
) {
  return (message?: MessageRaw) =>
    new Promise((resolve) => {
      const handle: EventsMapping['on_message'] = (session) => {
        if (isSameSender(adapter, data, session)) {
          resolve(session.message);
          return;
        }
        adapter.ctx.once('on_message', handle);
      };
      quick(message ?? 'corei18n.template.prompt').then(() => adapter.ctx.once('on_message', handle));
    });
}

function confirmFactory(
  quick: ReturnType<typeof quickFactory>,
  adapter: Adapter,
  data: Parameters<Adapter['session']>[1]
) {
  return (options?: { message: MessageRaw; sure: MessageRaw }) =>
    new Promise((resolve) => {
      const handle: EventsMapping['on_message'] = (session) => {
        if (isSameSender(adapter, data, session)) {
          resolve(session.message === (options?.sure ?? 'corei18n.template.confirm.sure'));
          return;
        }
        adapter.ctx.once('on_message', handle);
      };
      quick(options?.message ?? 'corei18n.template.confirm').then(() => adapter.ctx.once('on_message', handle));
    });
}

function error<K extends keyof CommandResult>(type: K, data?: CommandResult[K]) {
  return new CommandError(Object.assign(data ?? {}, { type }) as ConstructorParameters<typeof CommandError>[0]);
}

export abstract class Adapter<T extends Api = Api> implements AdapterImpl<T> {
  public constructor(
    ctx: Context,
    config: AdapterConfig,
    identity: string,
    Api: new (adapter: Adapter) => T,
    el: Elements = new Elements()
  ) {
    this.ctx = ctx;
    this.config = config;
    this.identity = identity;
    this.platform = config.extends;
    this.api = setProxy(new Api(this), this.ctx);
    this.elements = el;
    if (!this.ctx[Symbols.bot].get(this.platform)) this.ctx[Symbols.bot].set(this.platform, new Set());
    this.ctx[Symbols.bot].get(this.platform)!.add(this.api);
  }

  public abstract handle(...data: unknown[]): void;

  public abstract start(): void;

  public abstract stop(): void;

  public abstract send(action: string, params?: object): void | object | Promise<unknown> | null | undefined;

  protected online() {
    if (this.status.value !== 'offline') return;
    this.status.value = 'online';
    this.ctx.emit('status', { adapter: this, status: 'online' });
  }

  protected offline() {
    if (this.status.value !== 'online') return;
    this.status.value = 'offline';
    this.status.offlineTimes += 1;
    this.ctx.emit('status', { adapter: this, status: 'offline' });
  }

  protected session<N extends keyof EventApiType>(
    type: N,
    data: Omit<EventApiType[N], 'api' | 'send' | 'i18n' | 'format' | 'quick' | 'prompt' | 'confirm' | 'el' | 'error'>
  ) {
    const i18n = this.ctx.i18n.extends(this.config.lang);
    const send = sendMessageFactory(this, type, data);
    const format = formatFactory(i18n as I18n);
    const quick = quickFactory(send, i18n as I18n);
    const prompt = promptFactory(quick, this, data);
    const confirm = confirmFactory(quick, this, data);
    const { api, elements: el } = this;
    this.ctx.emit(
      type,
      ...([{ ...data, api, el, send, i18n, format, quick, prompt, confirm, error }] as unknown as [
        ...Parameters<(typeof this)['ctx']['emit']>
      ])
    );
  }

  public readonly ctx: Context;

  public readonly config: AdapterConfig;

  public readonly identity: string;

  public readonly platform: string;

  public readonly api: T;

  public readonly elements: Elements;

  public readonly status: AdapterStatus = {
    value: 'offline',
    createTime: new Date(),
    lastMsgTime: null,
    receivedMsg: 0,
    sentMsg: 0,
    offlineTimes: 0
  };

  selfId: EventDataTargetId = -1;
}

export default Adapter;
