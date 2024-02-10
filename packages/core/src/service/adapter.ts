import I18n from '@kotori-bot/i18n';
import { stringTemp } from '@kotori-bot/tools';
import type Api from './api';
import { Context, Symbols } from '../context';
import {
  EventDataApiBase,
  EventsList,
  EventDataTargetId,
  MessageScope,
  MessageRaw,
  MessageQuick,
  AdapterConfig,
  CommandResult,
  CommandArgType
} from '../types';
import Elements from './elements';
import { cancelFactory } from '../utils/factory';
import CommandError from '../utils/commandError';

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
      const { '0': message, '1': targetId } = argArray;
      const cancel = cancelFactory();
      ctx.emit('before_send', { api, message, messageType: MessageScope.PRIVATE, targetId, cancel: cancel.get() });
      if (cancel.value) return;
      api.sendPrivateMsg(message, targetId, argArray[2]);
    }
  });
  proxy.sendGroupMsg = new Proxy(api.sendGroupMsg, {
    apply(_, __, argArray) {
      const { '0': message, '1': targetId } = argArray;
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

function formatFactory(i18n: I18n) {
  return (template: string, data: Record<string, unknown> | CommandArgType[]) => {
    const params = data;
    if (Array.isArray(params)) {
      let str = i18n.locale(template);
      params.forEach((value, index) => {
        str = str.replaceAll(`{${index}}`, i18n.locale(typeof value === 'string' ? value : String(value)));
      });
      return str;
    }
    Object.keys(params).forEach((key) => {
      if (typeof params[key] !== 'string') params[key] = String(params[key]);
      params[key] = i18n.locale(params[key] as string);
    });
    return stringTemp(i18n.locale(template), params as Record<string, string>);
  };
}

function qucikFactory(send: ReturnType<typeof sendMessageFactory>, i18n: I18n) {
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

function error<K extends keyof CommandResult>(type: K, data?: CommandResult[K]) {
  return new CommandError(Object.assign(data ?? {}, { type }) as ConstructorParameters<typeof CommandError>[0]);
}

export abstract class Adapter<T extends Api = Api> implements AdapterImpl<T> {
  constructor(
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

  abstract handle(...data: unknown[]): void;

  abstract start(): void;

  abstract stop(): void;

  abstract send(action: string, params?: object): void | object | Promise<unknown> | null | undefined;

  protected online() {
    if (this.status.value !== 'offline') return;
    this.ctx.emit('status', { adapter: this, status: 'online' });
    this.status.value = 'online';
  }

  protected offline() {
    if (this.status.value !== 'online') return;
    this.ctx.emit('status', { adapter: this, status: 'offline' });
    this.status.value = 'offline';
    this.status.offlineTimes += 1;
  }

  protected session<N extends keyof EventApiType>(
    type: N,
    data: Omit<EventApiType[N], 'api' | 'send' | 'i18n' | 'format' | 'quick' | 'el' | 'error'>
  ) {
    const i18n = this.ctx.i18n.extends(this.config.lang);
    const send = sendMessageFactory(this, type, data);
    const format = formatFactory(i18n as I18n);
    const quick = qucikFactory(send, i18n as I18n);
    const { api, elements: el } = this;
    (this.ctx.emit as Function)(type, { ...data, api, el, send, i18n, format, quick, error });
  }

  readonly ctx: Context;

  readonly config: AdapterConfig;

  readonly identity: string;

  readonly platform: string;

  readonly api: T;

  readonly elements: Elements;

  readonly status: AdapterStatus = {
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
