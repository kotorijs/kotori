/* eslint import/no-dynamic-require: 0 */
/* eslint global-require: 0 */
import { isClass, none } from '@kotori-bot/tools';
import { resolve } from 'path';
import { Parser } from 'tsukiko';
import { type Context } from './context';
import { Symbols } from './symbols';
import { Service } from './service';

type ModuleInstanceClass = new (ctx: Context, config: ModuleConfig) => void;
type ModuleInstanceFunction = (ctx: Context, config: ModuleConfig) => void;

export interface ModuleExport {
  /*   meta?: {
    name: string;
    files: string[];
    main: string;
    config: ModuleConfig;
  }; */
  name?: string;
  main?: ModuleInstanceFunction;
  Main?: ModuleInstanceClass;
  default?: ModuleInstanceFunction | ModuleInstanceClass;
  inject?: string[];
  config?: ModuleConfig;
}

export interface ModuleConfig {
  filter: object;
}

declare module './events' {
  interface EventsMapping {
    ready_module(data: EventDataModule): void;
    dispose_module(data: EventDataModule): void;
  }
}

declare module './context' {
  interface Context {
    load: Modules['load'];
    unload: Modules['unload'];
    service: Modules['service'];
  }
}

interface EventDataModule {
  instance: ModuleExport /* | string */ | ModuleInstanceFunction | ModuleInstanceClass;
}

function handleFunction(func: ModuleInstanceFunction, ctx: Context, config: ModuleConfig) {
  func(ctx, config);
}

function handleCconstructor(Class: ModuleInstanceClass, ctx: Context, config: ModuleConfig) {
  none(new Class(ctx, config));
}

const DEFAULT_MODULE_CONFIG = { filter: {} };

export class Modules {
  private readonly ctx: Context;

  constructor(ctx: Context) {
    this.ctx = ctx;
  }

  load(instance: EventDataModule['instance']) {
    const ctx = this.ctx.extends(
      {},
      !this.ctx.identity && typeof instance === 'object' ? instance.name : this.ctx.identity
    );
    if (instance instanceof Function) {
      if (isClass(instance)) handleCconstructor(instance, ctx, DEFAULT_MODULE_CONFIG);
      else (instance as ModuleInstanceFunction)(ctx, DEFAULT_MODULE_CONFIG);
      this.ctx.emit('ready_module', { instance });
      return;
    }
    const { main, Main, inject, default: defaults, config } = instance;
    if (Array.isArray(inject)) {
      inject.forEach((identity) => {
        ctx[Symbols.container].forEach((service, name) => {
          if (!(service instanceof Service) || service.identity !== identity) return;
          ctx.inject(name as Exclude<keyof Context, Symbols | number>);
        });
      });
    }
    if (defaults) {
      if (isClass(defaults)) handleCconstructor(defaults, ctx, config ?? DEFAULT_MODULE_CONFIG);
      else handleFunction(defaults as ModuleInstanceFunction, ctx, config ?? DEFAULT_MODULE_CONFIG);
    } else if (main) {
      handleFunction(main, ctx, config ?? DEFAULT_MODULE_CONFIG);
    } else if (Main) {
      handleCconstructor(Main, ctx, config ?? DEFAULT_MODULE_CONFIG);
    }
    this.ctx.emit('ready_module', { instance });
  }

  unload(instance: EventDataModule['instance']) {
    this.ctx.emit('dispose_module', { instance });
  }

  service(name: string, instance: Service) {
    this.ctx.provide(name, instance);
    this.ctx.on('ready', () => (this.ctx.get(name) as Service).start());
    this.ctx.on('dispose', () => (this.ctx.get(name) as Service).stop());
  }
}

export default Modules;
