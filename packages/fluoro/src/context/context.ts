/*
 * @Author: Hotaru biyuehuya@gmail.com
 * @Blog: https://hotaru.icu
 * @Date: 2024-02-07 13:44:38
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2024-05-03 22:06:15
 */
import Tokens from './tokens';
import { Events, EventsMapping } from './events';
import Modules from './modules';

interface obj {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  [propName: string | number | symbol]: any;
}

interface ContextOrigin {
  readonly [Tokens.container]: Map<string, obj>;
  readonly [Tokens.table]: Map<string, string[]>;
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

const handler = <T>(value: T, ctx: Context): T => {
  if (!value || typeof value !== 'object' || !((value as T & { ctx: unknown }).ctx instanceof Context)) return value;
return new Proxy(value, {
    get(target, prop, receiver) {
      if (prop === 'ctx') return ctx;
      return Reflect.get(target, prop, receiver);
    }
  });
};

const DEFAULT_EXTENDS_NAME = 'sub';

export class Context implements ContextImpl {
  public readonly [Tokens.container]: Map<string, obj> = new Map();

  public readonly [Tokens.table]: Map<string, string[]> = new Map();

  public root: Context;

  public parent: Context | null = null;

  public constructor(root?: Context) {
    this.root = root || this;
    this.provide('events', root ? root.get('events')! : new Events<EventsMapping>());
    this.mixin('events', ['emit', 'on', 'once', 'off', 'offAll']);
    this.provide('modules', new Modules(this));
    this.mixin('modules', ['load', 'unload', 'service']);
  }

  public get<T = obj | undefined>(prop: string) {
    return this[Tokens.container].get(prop) as T;
  }

  public inject<T extends Keys>(prop: T) {
    if (this[prop] && !this[Tokens.container].has(prop)) return;
    this[prop] = this.get(prop) as (typeof this)[T];
  }

  public provide<T extends obj>(prop: string, value: T) {
    if (this[Tokens.container].has(prop)) return;
    this[Tokens.container].set(prop, value);
  }

  public mixin<K extends Keys>(prop: string, keys: K[]) {
    this[Tokens.table].set(prop, keys);
    const instance = this.get(prop);
    if (!instance) return;

    this[Tokens.table].set(prop, keys);
    keys.forEach((key) => {
      if (this[key] || !instance[key]) return;
      this[key] = instance[key] as this[K];
      if (typeof this[key] === 'function') {
        this[key] = (this[key] as () => unknown)?.bind(instance) as unknown as this[K];
      }
    });
  }

  public extends<T extends obj = object>(meta?: T, identity?: string) {
    const metaHandle = meta ?? ({} as T);
    /* clear function */
    Object.keys(metaHandle).forEach((key) => {
      if (typeof this[key as keyof this] === 'function') delete metaHandle[key];
    });
    /* set proxy */
    const ctx: Context = new Proxy(new Context(this.root), {
      get: <T extends Context>(target: T, prop: keyof T) => {
        if (prop === 'identity') return identity ?? this.identity ?? DEFAULT_EXTENDS_NAME;
        if (prop === 'parent') return this;
        if (target[prop]) return handler(target[prop], ctx);

        let value: unknown;
        this[Tokens.table].forEach((keys, key) => {
          if (value || (typeof prop === 'string' && !keys.includes(prop))) return;
          const instance = ctx[Tokens.container].get(key);
          if (!instance) return;
          value = instance[prop];
          if (typeof value === 'function') value = value.bind(instance);
        });

        if (value !== undefined) return value;
        if (metaHandle[prop]) return handler(metaHandle[prop], ctx);
        return handler(this[prop as keyof this], ctx);
      }
    });
    /* set table */
    this[Tokens.table].forEach((value, key) => ctx[Tokens.table].set(key, value));
    /* set container */
    this[Tokens.container].forEach((value, key) => {
      if (!value.ctx) return ctx[Tokens.container].set(key, value);
      return ctx[Tokens.container].set(key, handler(value, ctx));
    });
    return ctx;
  }
}

export default Context;
