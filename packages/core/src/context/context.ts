import Symbols from './symbols';

interface obj {
  [propName: string | number | symbol]: any;
}

interface ContextOrigin {
  readonly [Symbols.container]: Map<string, obj>;
  readonly [Symbols.table]: Map<string, string[]>;
  root: Context;
  get(prop: string): obj | undefined;
  inject<T extends Keys>(prop: T): void;
  provide<T extends obj>(prop: string, value: T): void;
  mixin<K extends Keys>(prop: string, keys: K[]): void;
  extends<T extends obj>(meta?: T, identity?: string): Context;
}

interface ContextImpl extends ContextOrigin {}

declare module './context' {
  interface Context {
    identity?: string;
  }
}

type Keys = keyof Omit<Context, keyof ContextOrigin> & string;

export class Context implements ContextImpl {
  readonly [Symbols.container]: Map<string, obj> = new Map();

  readonly [Symbols.table]: Map<string, string[]> = new Map();

  root: Context;

  constructor(root?: Context) {
    this.root = root || this;
  }

  get(prop: string) {
    return this[Symbols.container].get(prop);
  }

  inject<T extends Keys>(prop: T) {
    if (this[prop] && !this[Symbols.container].has(prop)) return;
    this[prop] = this.get(prop) as (typeof this)[T];
  }

  provide<T extends obj>(prop: string, value: T) {
    if (this[Symbols.container].has(prop)) return;
    this[Symbols.container].set(prop, value);
  }

  mixin<K extends Keys>(prop: string, keys: K[]) {
    this[Symbols.table].set(prop, keys);
    const instance = this.get(prop);
    if (!instance) return;
    this[Symbols.table].set(prop, keys);
    keys.forEach((key) => {
      if (this[key] || !instance[key]) return;
      this[key] = instance[key];
      if (typeof this[key] === 'function') this[key] = (this[key] as Function).bind(instance);
    });
  }

  extends<T extends obj = {}>(meta: T = {} as T, identity: string = 'sub') {
    const metaHandle = meta;
    /* clear function */
    Object.keys(metaHandle).forEach((key) => {
      if (typeof this[key as keyof this] === 'function') delete metaHandle[key];
    });
    const handler = <T>(value: T, ctx: Context): T => {
      if (!value || typeof value !== 'object' || !(value as T & { ctx: unknown }).ctx) return value;
      return new Proxy(value, {
        get(target, prop, receiver) {
          if (prop === 'ctx') return ctx;
          return Reflect.get(target, prop, receiver);
        }
      });
    };
    /* set proxy */
    const ctx: Context = new Proxy(new Context(this.root), {
      get: <T>(target: T, prop: keyof T) => {
        if (prop === 'identity') return identity;
        if (target[prop]) return target[prop];
        let value: unknown;
        this[Symbols.table].forEach((keys, key) => {
          if (value || (typeof prop === 'string' && !keys.includes(prop))) return;
          value = ctx[Symbols.container].get(key)![prop];
          if (typeof value === 'function') value = value.bind(ctx[Symbols.container].get(key));
        });
        if (value !== undefined) return value;
        if (meta[prop]) return handler(meta[prop], ctx);
        return handler(this[prop as keyof this], ctx);
      }
    });
    /* set table */
    this[Symbols.table].forEach((value, key) => ctx[Symbols.table].set(key, value));
    /* set container */
    this[Symbols.container].forEach((value, key) => {
      if (!value.ctx) return ctx[Symbols.container].set(key, value);
      return ctx[Symbols.container].set(key, handler(value, ctx));
    });
    return ctx;
  }
}

export default Context;
