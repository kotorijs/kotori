import type I18n from '@kotori-bot/i18n';
import { stringTemp, type obj } from '@kotori-bot/tools';
import type { Context } from '../context/index';
import { CommandError } from './commandError';
import type { EventDataTargetId, MessageQuick, MessageRaw, MessageScope } from '../types/index';
import type { Adapter } from '../components/adapter';

export function disposeFactory(ctx: Context, dispose: Function) {
  ctx.on('dispose', (session) => {
    // if (!session.module) return;
    if (
      typeof session.module === 'object'
        ? session.module.package.name === ctx.identity
        : session.module === ctx.identity
    )
      dispose();
  });
}

export function cancelFactory() {
  return {
    get() {
      return () => this.fn();
    },
    fn() {
      this.value = true;
    },
    value: false
  };
}

export function objectTempFactory(i18n: I18n) {
  return (obj: obj<string | number>) => {
    const result = obj;
    Object.keys(result).forEach((key) => {
      if (!result[key] || typeof result[key] !== 'string') return;
      result[key] = i18n.locale(result[key] as string);
    });
    return result;
  };
}

export function sendMessageFactory(adapter: Adapter, type: MessageScope, data: Parameters<Adapter['emit']>[1]) {
  if (type === 'group' && 'groupId' in data) {
    return (message: MessageRaw) => {
      adapter.api.send_group_msg(message, data.groupId as EventDataTargetId, data.extra);
    };
  }
  return (message: MessageRaw) => {
    adapter.api.send_private_msg(message, data.userId, data.extra);
  };
}

export function qucikFactory(send: ReturnType<typeof sendMessageFactory>, i18n: I18n) {
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
