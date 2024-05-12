import I18n from '@kotori-bot/i18n/src/common';
import type { Context } from 'fluoro';
import { CommandArgType, stringTemp } from '..';

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
