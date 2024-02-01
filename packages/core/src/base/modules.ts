import { isClass, none } from '@kotori-bot/tools';
import { Parser, TsuError } from 'tsukiko';
import { resolve } from 'path';
import { DevError, ModuleError } from '../utils/errror';
import { type ModuleInstance, moduleConfigBaseSchema, type AdapterClass, ServiceClass } from '../types/index';
import { Symbols, type Context } from '../context/index';
import { Adapter, Service } from '../components';
import { ADAPTER_PREFIX } from '../consts';
import { disposeFactory } from '../utils/factory';

type ModuleInstanceClass = new (ctx: Context, config: object) => void;
type ModuleInstanceFunction = (ctx: Context, config: object) => void;

declare module '../context/index' {
  interface Context {
    load(modules: ModuleInstance | ModuleInstanceFunction | ModuleInstanceClass, config?: object): void;
    dispose(modules: ModuleInstance): void;
  }
}

function isServiceConsructor(Fn: Function): Fn is ServiceClass {
  return Service.isPrototypeOf.call(Service, Fn);
}

function isAdapterClass(Fn: Function): Fn is AdapterClass {
  return Adapter.isPrototypeOf.call(Adapter, Fn);
}

/*   static isDatabaseClass(Obj: object): Obj is DatabaseClass {
    return Database.isPrototypeOf.call(Database, Obj);
  } */

function handleFunction(func: ModuleInstanceFunction, ctx: Context, config: object) {
  func(ctx, config);
}

function handleCconstructor(Class: ModuleInstanceClass, ctx: Context, config: object) {
  none(new Class(ctx, config));
}

function checkConfig(schema: unknown, config: object) {
  const resultSchema1 = moduleConfigBaseSchema.parseSafe(config);
  if (!resultSchema1.value) return resultSchema1.error;
  if (!(schema instanceof Parser)) return resultSchema1.data;
  const resultSchema2 = (schema as typeof moduleConfigBaseSchema).parseSafe(resultSchema1.data);
  if (resultSchema2 && !resultSchema2.value) return resultSchema2.error;
  return resultSchema2.data;
}

export class Modules {
  private handleObj(modules: ModuleInstance, config: object) {
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

  load(modules: ModuleInstance | ModuleInstanceFunction | ModuleInstanceClass, config: object = {}) {
    if (modules instanceof Function) {
      if (isClass(modules)) return handleCconstructor(modules, this.ctx, {});
      return handleFunction(modules as ModuleInstanceFunction, this.ctx, {});
    }
    disposeFactory(this.ctx, () => this.dispose(modules));
    const error = this.handleObj(modules, config);
    this.ctx.emit('ready', { module: modules, state: !!error });
    if (error) this.ctx.emit('error', { error });
    return undefined;
  }

  dispose(modules: /*  string | */ ModuleInstance) {
    modules.fileList.forEach((file) => delete require.cache[require.resolve(file)]);
    this.ctx.emit('dispose', { module: modules });
  }
}

export default Modules;
