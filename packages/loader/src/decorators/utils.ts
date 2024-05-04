import { resolve } from 'path';
import {
  Symbols,
  Context,
  EventsList,
  Service,
  CommandAccess,
  MessageScope,
  Parser,
  ModuleConfig,
  ModuleError,
  PLUGIN_PREFIX,
  Tokens
} from '@kotori-bot/core';

type Fn = (...args: unknown[]) => void;

export class Decorators {
  private readonly ctx: Context;

  private isCreated = false;

  private pkgName: string;

  private object?: object;

  /* eslint-disable @typescript-eslint/no-explicit-any */
  private register(callback: (...args: any[]) => void) {
    return (...args: any[]) =>
      this.ctx.parent!.once('ready_module', (data) => {
        if (data.instance.name === this.pkgName) {
          callback(...args);
          return;
        }
        this.register(callback);
      });
  }
  /* eslint-enable @typescript-eslint/no-explicit-any */

  public constructor(ctx: Context) {
    this.ctx = ctx;
    this.pkgName = `${PLUGIN_PREFIX}${ctx.identity}`;
  }

  public readonly import = (Target: object) => {
    this.register(() => {
      if (!this.isCreated) this.schema(Target, undefined as keyof object);
    })();
  };

  public readonly lang = <T extends object>(target: T, property: keyof T) => {
    this.register(() => {
      const lang = target[property] as string | string[];
      this.ctx.parent!.i18n.use(resolve(...(Array.isArray(lang) ? lang : [lang])));
    })();
  };

  public readonly inject = <T extends object>(target: T, property: keyof T) => {
    this.register(() => {
      const inject = target[property] as string[];
      inject.forEach((identity) =>
        this.ctx[Tokens.container].forEach((service, name) => {
          if (!(service instanceof Service) || service.identity !== identity) return;
          this.ctx.inject(name as Exclude<keyof Context, Symbols | number>);
        })
      );
    })();
  };

  public readonly schema = <T extends object>(Target: T, property: keyof T) => {
    this.register(() => {
      let config = (this.ctx[Symbols.modules].get(this.pkgName!) ?? [])[1];
      const result = (Target[property] as Parser<ModuleConfig>).parseSafe(config);
      if (!result.value)
        throw new ModuleError(`Config format of module ${this.pkgName} is error: ${result.error.message}`);
      config = result.data;
      if (this.isCreated) return;
      this.isCreated = true;
      this.object = new (Target as new (...args: unknown[]) => object)(this.ctx, config);
    })();
  };

  public on<T extends keyof EventsList>(meta: { type: T }) {
    return this.register(<T extends object>(target: T, property: keyof T) =>
      this.ctx.on(meta.type, (...args: unknown[]) => (target[property] as Fn).bind(this.object)(...args))
    );
  }

  public once<T extends keyof EventsList>(meta: { type: T }) {
    return this.register(<T extends object>(target: T, property: keyof T) =>
      this.ctx.once(meta.type, (...args: unknown[]) => (target[property] as Fn).bind(this.object)(...args))
    );
  }

  public midware(meta?: { priority: number }) {
    return this.register(<T extends object>(target: T, property: keyof T) =>
      this.ctx.midware((next, session) => (target[property] as Fn).bind(this.object)(next, session), meta?.priority)
    );
  }

  public command(meta: {
    template: string;
    alias?: string[];
    description?: string;
    help?: string;
    scope?: MessageScope | 'all';
    access?: CommandAccess;
    options?: [string, string][];
  }) {
    return this.register(<T extends object>(target: T, property: keyof T) => {
      const command = this.ctx
        .command(meta.template, meta)
        .action((data, session) => (target[property] as Fn).bind(this.object)(data, session));
      meta.options?.forEach(([name, template]) => command.option(name, template));
    });
  }

  public regexp(meta: { match: RegExp }) {
    return this.register(<T extends object>(target: T, property: keyof T) =>
      this.ctx.regexp(meta.match, (match, session) => (target[property] as Fn).bind(this.object)(match, session))
    );
  }
}

export default Decorators;
