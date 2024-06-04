import type { Context, EventsMapping } from 'fluoro';
import type { I18n } from '@kotori-bot/i18n';
import { stringTemp } from '@kotori-bot/tools';
import {
  MessageScope,
  type CommandArgType,
  MessageRaw,
  MessageQuick,
  SessionData,
  EventDataTargetId,
  EventApiType
} from '../types';
import type { Adapter } from '../service/adapter';
import { CommandError } from '..';

export function disposeFactory(ctx: Context, dispose: () => void) {
  ctx.once('dispose_module', (data) => {
    if ((typeof data.instance === 'object' ? data.instance.name : data.instance) !== ctx.identity) {
      disposeFactory(ctx, dispose);
      return;
    }
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

export function formatFactory(i18n: I18n) {
  return (template: string, data: Record<string, CommandArgType | undefined> | (CommandArgType | undefined)[]) => {
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

export function sendMessageFactory(
  adapter: Adapter,
  type: keyof EventApiType,
  data: Parameters<Adapter['session']>[1]
) {
  if ((data.type === MessageScope.GROUP || type.includes('group')) && 'groupId' in data) {
    return (message: MessageRaw) => {
      adapter.api.sendGroupMsg(message, data.groupId as EventDataTargetId, data.extra);
    };
  }
  return (message: MessageRaw) => {
    adapter.api.sendPrivateMsg(message, data.userId, data.extra);
  };
}

export function quickFactory(send: ReturnType<typeof sendMessageFactory>, i18n: I18n) {
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

export function promptFactory(
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

export function confirmFactory(
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
