import I18n from '@kotori-bot/i18n';
import type Api from './api';
import { Context, Symbols } from '../context/index';
import type {
  EventDataApiBase,
  AdapterConfig,
  EventsList,
  EventDataTargetId,
  MessageScope,
  AdapterImpl,
  AdapterStatus
} from '../types/index';
import Service from './service';
import Elements from './elements';
import { cancelFactory, qucikFactory, sendMessageFactory } from '../utils/factory';

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

  protected abstract send(action: string, params?: object): void | object | Promise<unknown> | null | undefined;

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
