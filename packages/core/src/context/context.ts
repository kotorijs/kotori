import { obj } from '@kotori-bot/tools';
import Symbols from './symbols';

export class Context {
  private static handler(): ProxyHandler<Context> {
    return {
      get(target, prop, receiver) {
        if (typeof prop !== 'string' || prop in target) return Reflect.get(target, prop, receiver);
        return Reflect.get(target, Symbols.mixins)[prop];
      }
    };
  }

  private readonly container: obj<object> = {};

  readonly [Symbols.mixins]: obj<object> = {};

  root: Context;

  constructor(config: { root?: Context; mixins?: obj<object> }) {
    this.root = config.root || this;
  }

  inject(prop: string): unknown {
    return this.container[prop];
  }

  provide(prop: string, value: object) {
    if (this.container[prop]) return;
    this.container[prop] = value;
  }

  mixin(value: object) {
    Object.keys(value).forEach((key) => {
      this[Symbols.mixins][key] = value[key as keyof typeof value];
    });
  }

  extends() {
    return new Proxy(this, Context.handler());
  }
}

export default Context;
