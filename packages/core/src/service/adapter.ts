import I18n from '@kotori-bot/i18n';
import { obj, stringTemp } from '@kotori-bot/tools';
import type Api from './api';
import { Context, Symbols } from '../context';
import type {
  EventDataApiBase,
  EventsList,
  EventDataTargetId,
  MessageScope,
  AdapterImpl,
  AdapterStatus,
  MessageRaw,
  MessageQuick,
  AdapterConfig
} from '../types';
import Service from './service';
import Elements from './elements';
import { cancelFactory } from '../utils/factory';
import CommandError from '../utils/commandError';

type EventApiType = {
  [K in Extract<EventsList[keyof EventsList], EventDataApiBase<keyof EventsList, MessageScope>>['type']]: EventsList[K];
};

type ApiClass<T extends Api> = new (adapter: Adapter, el: Elements) => T;

function setProxy<T extends Api>(api: T, ctx: Context): T {
  const proxy = Object.create(api) as T;
  proxy.send_private_msg = new Proxy(api.send_private_msg, {
    apply(_, __, argArray) {
      const { '0': message, '1': targetId } = argArray;
      const cancel = cancelFactory();
      ctx.emit('before_send', { api, message, messageType: 'private', targetId, cancel: cancel.get() });
      if (cancel.value) return;
      api.send_private_msg(message, targetId, argArray[2]);
    }
  });
  proxy.send_group_msg = new Proxy(api.send_group_msg, {
    apply(_, __, argArray) {
      const { '0': message, '1': targetId } = argArray;
      const cancel = cancelFactory();
      ctx.emit('before_send', { api, message, messageType: 'group', targetId, cancel: cancel.get() });
      if (cancel.value) return;
      api.send_group_msg(message, targetId, argArray[2]);
    }
  });
  return proxy;
}

function sendMessageFactory(adapter: Adapter, type: MessageScope, data: Parameters<Adapter['emit']>[1]) {
  if (type === 'group' && 'groupId' in data) {
    return (message: MessageRaw) => {
      adapter.api.send_group_msg(message, data.groupId as EventDataTargetId, data.extra);
    };
  }
  return (message: MessageRaw) => {
    adapter.api.send_private_msg(message, data.userId, data.extra);
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
    const params = msg[1];
    Object.keys(params).forEach((key) => {
      if (typeof params[key] !== 'string') return;
      params[key] = i18n.locale(params[key] as string);
    });
    send(stringTemp(i18n.locale(msg[0]), params as obj<string>));
  };
}

export abstract class Adapter<T extends Api = Api> extends Service implements AdapterImpl<T> {
  constructor(
    ctx: Context,
    config: AdapterConfig,
    identity: string,
    ApiClass: ApiClass<T>,
    El: new (adapter: Adapter) => Elements = Elements
  ) {
    super('adapter', '');
    this.ctx = ctx;
    this.config = config;
    this.identity = identity;
    this.platform = config.extends;
    this.api = setProxy(new ApiClass(this, new El(this)), this.ctx);
    if (!this.ctx[Symbols.bot].get(this.platform)) this.ctx[Symbols.bot].set(this.platform, new Set());
    this.ctx[Symbols.bot].get(this.platform)!.add(this.api);
  }

  abstract send(action: string, params?: object): void | object | Promise<unknown> | null | undefined;

  protected online() {
    if (this.status.value !== 'offline') return;
    this.ctx.emit('online', { adapter: this });
    this.status.value = 'online';
  }

  protected offline() {
    if (this.status.value !== 'online') return;
    this.ctx.emit('offline', { adapter: this });
    this.status.value = 'offline';
    this.status.offlineTimes += 1;
  }

  protected emit<N extends keyof EventApiType>(
    type: N,
    data: Omit<EventApiType[N], 'type' | 'api' | 'send' | 'i18n' | 'quick' | 'el' | 'messageType'>
  ) {
    const messageType = type.includes('group') ? 'group' : 'private';
    const i18n = this.ctx.i18n.extends(this.config.lang);
    const send = sendMessageFactory(this, messageType, data);
    const quick = qucikFactory(send, i18n as I18n);
    const { api } = this;
    const { elements: el } = this.api;
    this.ctx.emit<N>(type, { ...data, api, send, i18n, quick, el, messageType } as unknown as EventsList[N]);
  }

  readonly ctx: Context;

  readonly config: AdapterConfig;

  readonly identity: string;

  readonly platform: string;

  readonly api: T;

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
