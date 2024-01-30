import { stringTemp } from '@kotori-bot/tools';
import type Api from './api';
import type Context from '../context';
import type {
  EventDataApiBase,
  MessageQuickFunc,
  AdapterConfig,
  EventsList,
  MessageRaw,
  EventDataTargetId,
  CommandResult,
  CommandResultExtra,
  ApiConstructor,
  MessageScope,
  AdapterImpl,
  AdapterStatus
} from '../types';
import Service from './service';
import Elements from './elements';

type EventApiType = {
  [K in Extract<EventsList[keyof EventsList], EventDataApiBase<keyof EventsList, MessageScope>>['type']]: EventsList[K];
};

export abstract class Adapter<T extends Api = Api> extends Service implements AdapterImpl<T> {
  private static apiProxy<T extends Api>(api: T, ctx: Context): T {
    const apiProxy = Object.create(api) as T;
    apiProxy.send_private_msg = new Proxy(api.send_private_msg, {
      apply(_, __, argArray) {
        const { '0': message, '1': targetId } = argArray;
        let isCancel = false;
        const cancel = () => {
          isCancel = true;
        };
        ctx.emit('before_send', { api, message, messageType: 'private', targetId, cancel });
        if (isCancel) return;
        api.send_private_msg(message, targetId, argArray[2]);
      }
    });
    apiProxy.send_group_msg = new Proxy(api.send_group_msg, {
      apply(_, __, argArray) {
        const { '0': message, '1': targetId } = argArray;
        let isCancel = false;
        const cancel = () => {
          isCancel = true;
        };
        ctx.emit('before_send', { api, message, messageType: 'group', targetId, cancel });
        if (isCancel) return;
        api.send_group_msg(message, targetId, argArray[2]);
      }
    });
    return apiProxy;
  }

  constructor(
    ctx: Context,
    config: AdapterConfig,
    identity: string,
    ApiConstructor: ApiConstructor<T>,
    El: new (adapter: Adapter) => Elements = Elements
  ) {
    super('adapter', '');
    this.ctx = ctx;
    this.config = config;
    this.identity = identity;
    this.platform = config.extends;
    this.api = Adapter.apiProxy(new ApiConstructor(this, new El(this)), this.ctx);
    if (!this.ctx.internal.getBots()[this.platform]) this.ctx.internal.setBots(this.platform, []);
    this.ctx.internal.getBots()[this.platform].push(this.api);
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
    data: Omit<EventApiType[N], 'type' | 'api' | 'send' | 'i18n' | 'quick' | 'error' | 'el' | 'messageType'>
  ) {
    const messageType = type.includes('group') ? 'group' : 'private';
    const send = (message: MessageRaw) => {
      if (messageType === 'group') {
        this.api.send_group_msg(message, (data as unknown as { groupId: EventDataTargetId }).groupId, data.extra);
      } else {
        this.api.send_private_msg(message, data.userId, data.extra);
      }
    };
    const i18n = this.ctx.i18n.extends(this.config.lang);
    const quick: MessageQuickFunc = async (message) => {
      const msg = await message;
      if (!msg) return;
      if (typeof msg === 'string') {
        send(i18n.locale(msg));
        return;
      }
      const params = msg[1];
      Object.keys(params).forEach((key) => {
        if (typeof params[key] !== 'string') return;
        params[key] = i18n.locale(params[key] as string);
      });
      send(stringTemp(i18n.locale(msg[0]), params));
    };
    const error = <T extends keyof CommandResult>(
      type: T,
      data?: Omit<CommandResultExtra[T], 'type'>
    ): CommandResultExtra[T] =>
      ({
        type,
        ...data
      }) as CommandResultExtra[T];
    this.ctx.emit(type, {
      ...data,
      api: this.api,
      send,
      i18n,
      quick,
      error,
      el: this.api.elements,
      messageType
    } as unknown as EventsList[N]);
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
