import { isClass, none } from '@kotori-bot/tools';
import { Parser, TsuError } from 'tsukiko';
import { resolve } from 'path';
import { DevError, ModuleError } from '../utils/errror';
import type { ModuleInstance, AdapterClass, ServiceClass, ModuleConfig } from '../types';
import { Symbols, type Context } from '../context';
import { Adapter, Service } from '../service';
import { ADAPTER_PREFIX } from '../consts';
import { disposeFactory } from '../utils/factory';
import {} from '../types';

type ModuleInstanceClass = new (ctx: Context, config: ModuleConfig) => void;
type ModuleInstanceFunction = (ctx: Context, config: ModuleConfig) => void;

function isServiceConsructor(Fn: Function): Fn is ServiceClass {
  return Service.isPrototypeOf.call(Service, Fn);
}

function isAdapterClass(Fn: Function): Fn is AdapterClass {
  return Adapter.isPrototypeOf.call(Adapter, Fn);
}

/*   static isDatabaseClass(Obj: object): Obj is DatabaseClass {
    return Database.isPrototypeOf.call(Database, Obj);
  } */

function handleFunction(func: ModuleInstanceFunction, ctx: Context, config: ModuleConfig) {
  func(ctx, config);
}

function handleCconstructor(Class: ModuleInstanceClass, ctx: Context, config: ModuleConfig) {
  none(new Class(ctx, config));
}

function checkConfig(schema: unknown, config: ModuleConfig) {
  if (!(schema instanceof Parser)) return config;
  const result = (schema as Parser<ModuleConfig>).parseSafe(config);
  if (result && !result.value) return result.error;
  return result.data;
}

export class Modules {
  private handleObj(modules: ModuleInstance, config: ModuleConfig) {
    /* before handle */
    const { lang, config: schema, default: defaults, main, Main } = modules.exports;
    if (lang) {
      this.ctx.i18n.use(Array.isArray(lang) ? resolve(...lang) : resolve(lang));
    }
    const moduleName = modules.package.name;
    /* handle */
    /* service */
    if (isServiceConsructor(defaults)) {
      /* adapter */
      const adapterName = moduleName.split(ADAPTER_PREFIX)[1];
      // const databaseName = moduleName.split(DATABASE_PREFIX)[1];
      if (adapterName && isAdapterClass(defaults)) {
        this.ctx[Symbols.adapter].set(adapterName, [defaults, schema]);
      } /* else if (databaseName && isDatabaseClass(default)) {
        
      } */
      return undefined;
    }
    /* plugin */
    const moduleConfig = checkConfig(schema, config);
    if (moduleConfig instanceof TsuError)
      return new ModuleError(`Config format of module ${moduleName} is error: ${moduleConfig.message}`);
    if (defaults !== undefined) {
      if (isClass(defaults)) {
        return handleCconstructor(defaults, this.ctx, moduleConfig);
      }
      if (defaults instanceof Function) {
        return handleFunction(defaults, this.ctx, moduleConfig);
      }
      return new DevError(`Module instance of default export is not function or constructor at ${moduleName}`);
    }
    if (main instanceof Function) {
      if (isClass(main)) {
        return new DevError(`Module instance is constructor,export name should be 'Main' not 'main' at ${moduleName}`);
      }
      return handleFunction(main, this.ctx, moduleConfig);
    }
    if (Main instanceof Function) {
      if (!isClass(Main)) {
        return new DevError(`Module instance is function,export name should be 'main' not 'Main' at ${moduleName}`);
      }
      return handleCconstructor(Main, this.ctx, moduleConfig);
    }
    return undefined;
  }

  private readonly ctx: Context;

  constructor(ctx: Context) {
    this.ctx = ctx;
  }

  load(modules: ModuleInstance | ModuleInstanceFunction | ModuleInstanceClass, config: ModuleConfig = { filter: {} }) {
    if (modules instanceof Function) {
      if (isClass(modules)) return handleCconstructor(modules, this.ctx, config);
      return handleFunction(modules as ModuleInstanceFunction, this.ctx, config);
    }
    disposeFactory(this.ctx, () => this.dispose(modules));
    const error = this.handleObj(modules, config);
    this.ctx.emit('ready', { module: modules, state: !error });
    if (error) this.ctx.emit('error', { error });
    return undefined;
  }

  dispose(modules: /*  string | */ ModuleInstance) {
    modules.fileList.forEach((file) => delete require.cache[require.resolve(file)]);
    this.ctx.emit('dispose', { module: modules });
  }
}

export default Modules;
