import Symbols from './symbols';

export interface Context {
  readonly [Symbols.container]: Map<string | symbol, object>;
  root: Context;
  identity?: string;
  get<T extends object = object>(prop: string): T | undefined;
  inject<T extends object = object>(prop: string, value: T): void;
  provide<T extends object>(prop: string | symbol, value: T): void;
  mixin<K extends keyof Omit<Context, ContextOriginKey> & string>(prop: string, keys: K[]): void;
  extends<T extends object>(meta?: T, identity?: string): Context;
}

type ContextOriginKey = 'root' | 'identity' | 'inject' | 'provide' | 'mixin' | 'extends';

export class Context implements Context {
  readonly [Symbols.container]: Map<string | symbol, object> = new Map();

  root: Context;

  constructor(root?: Context) {
    this.root = root || this;
  }

  get(prop: string) {
    return this[Symbols.container].get(prop);
  }

  inject<T extends object>(prop: string, value?: T) {
    const key = value ? Symbols.containerKey(prop) : prop;
    if (value) {
      if (this[Symbols.container].has(key)) return;
      this.provide(key, value);
    } else if (!this[Symbols.container].has(key)) return;
    if (key in this) return;
    const val = this[prop as keyof typeof this];
    this[prop as keyof typeof this] = this.get(key as string) as typeof val;
  }

  provide<T extends object>(prop: string, value: T) {
    if (this[Symbols.container].has(prop)) return;
    this[Symbols.container].set(prop, value);
  }

  mixin<K extends keyof Omit<Context, ContextOriginKey> & string>(prop: K, keys: K[]) {
    if (!this[Symbols.container].has(prop)) return;
    keys.forEach((key) => {
      if (typeof key === 'symbol') return;
      if (key in this) return;
      const instance = this.get(prop);
      if (!instance) return;
      if (!(key in instance)) return;
      if (typeof instance[key as keyof typeof instance] === 'function') {
        this[key] = (instance[key as keyof typeof instance] as Function).bind(instance);
        return;
      }
      this[key] = instance[key as keyof typeof instance];
    });
  }

  extends<T extends object = {}>(meta: T = {} as T, identity: string = 'sub') {
    const metaHandle = meta;
    Object.keys(metaHandle).forEach((key) => {
      if (typeof this[key as keyof typeof this] === 'function') delete metaHandle[key as keyof T];
    });
    const ctx = Object.assign(new Context(this.root), this, meta, { identity });

    ctx[Symbols.container].forEach((value, key) => {
      if (!('ctx' in value)) {
        ctx[Symbols.container].set(key, value);
        return;
      }
      const instance = Object.assign(value, { ctx });
      ctx[Symbols.container].set(key, instance);
    });
    return ctx;
  }
}

export default Context;
