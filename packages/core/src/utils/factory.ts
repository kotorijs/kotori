import type I18n from '@kotori-bot/i18n';
import { stringTemp, type obj } from '@kotori-bot/tools';
import type { Context } from '../context';
import { CommandError } from './commandError';
import type { EventDataTargetId, MessageQuick, MessageRaw, MessageScope } from '../types';
import type { Adapter } from '../service/adapter';

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
