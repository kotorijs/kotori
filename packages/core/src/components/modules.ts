import { isClass, none, obj } from '@kotori-bot/tools';
import { Parser, TsuError } from 'tsukiko';
import { resolve } from 'path';
import { DevError, ModuleError } from '../utils/errror';
import type { ModuleInstance, AdapterClass, ServiceClass, ModuleConfig } from '../types';
import { Symbols, type Context } from '../context';
import { Adapter, Service } from '../service';
import { ADAPTER_PREFIX } from '../consts';
import { disposeFactory } from '../utils/factory';

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
  private handleExports(identity: string, ctx: Context, exports: obj, config: ModuleConfig) {
    /* before handle */
    const { lang, config: schema, default: defaults, main, Main } = exports.default;
    if (lang) this.ctx.i18n.use(Array.isArray(lang) ? resolve(...lang) : resolve(lang));
    /* handle */
    if (isServiceConsructor(defaults)) {
      /* adapter */
      const adapterName = identity.split(ADAPTER_PREFIX)[1];
      // const databaseName = moduleName.split(DATABASE_PREFIX)[1];
      if (adapterName && isAdapterClass(defaults)) {
        this.ctx[Symbols.adapter].set(adapterName, [defaults, schema]);
      } /* else if (databaseName && isDatabaseClass(default)) {
        service and database
      } */
      return undefined;
    }
    /* plugin */
    const moduleConfig = checkConfig(schema, config);
    if (moduleConfig instanceof TsuError)
      return new ModuleError(`Config format of module ${identity} is error: ${moduleConfig.message}`);
    if (defaults !== undefined) {
      if (isClass(defaults)) {
        return handleCconstructor(defaults, ctx, moduleConfig);
      }
      if (defaults instanceof Function) {
        return handleFunction(defaults, ctx, moduleConfig);
      }
      return new DevError(`Module instance of default export is not function or constructor at ${identity}`);
    }
    if (main instanceof Function) {
      if (isClass(main)) {
        return new DevError(`Module instance is constructor,export name should be 'Main' not 'main' at ${identity}`);
      }
      return handleFunction(main, ctx, moduleConfig);
    }
    if (Main instanceof Function) {
      if (!isClass(Main)) {
        return new DevError(`Module instance is function,export name should be 'main' not 'Main' at ${identity}`);
      }
      return handleCconstructor(Main, ctx, moduleConfig);
    }
    return undefined;
  }

  private readonly ctx: Context;

  constructor(ctx: Context) {
    this.ctx = ctx;
  }

  async use(modules: ModuleInstance | string | ModuleInstanceFunction | ModuleInstanceClass, config: ModuleConfig) {
    const isObject = typeof modules === 'object';
    const ctx = this.ctx.extends({}, !this.ctx.identity && isObject ? modules.pkg.name : this.ctx.identity);
    if (modules instanceof Function) {
      if (isClass(modules)) handleCconstructor(modules, ctx, config);
      else handleFunction(modules as ModuleInstanceFunction, ctx, config);
      return;
    }
    disposeFactory(ctx, () => this.dispose(modules));
    const identity = isObject ? modules.pkg.name : modules;
    try {
      const exports = await import(`file://${isObject ? modules.main : resolve(modules)}`);
      const error = this.handleExports(identity, ctx, exports, config);
      if (error) throw error;
      this.ctx.emit('ready', { module: modules, state: true });
    } catch (error) {
      this.ctx.emit('ready', { module: modules, state: false });
      if (error) this.ctx.emit('error', { error });
    }
  }

  dispose(modules: ModuleInstance | string) {
    if (typeof modules === 'object') modules.files.forEach((file) => delete require.cache[require.resolve(file)]);
    this.ctx.emit('dispose', { module: modules });
  }
}

export default Modules;
