import { isClass, none } from '@kotori-bot/tools';
import { Parser, TsuError } from 'tsukiko';
import { DevError, ModuleError } from '../utils/errror';
import { ModuleConfig, ModuleInstance, moduleConfigBaseSchema } from '../types';
import { Context } from '../context';

type ModuleInstanceClass = new (ctx: Context, config: object) => void;
type ModuleInstanceFunction = (ctx: Context, config: object) => void;

export interface Modules {
  // use(file: string, config?: ModuleConfig): void;
  use(modules: ModuleInstance, config?: ModuleConfig): void;
  use(func: ModuleInstanceFunction, config?: ModuleConfig): void;
  use(Fnuc: ModuleInstanceClass, config?: ModuleConfig): void;
  dispose(modules: ModuleInstance): void;
}

declare module '../context' {
  interface Context extends Modules {}
}

export class Modules implements Modules {
  /*   static isServiceConsructor(Obj: object): Obj is ServiceClass {
    return Service.isPrototypeOf.call(Service, Obj);
  }

  static isAdapterClass(Obj: object): Obj is AdapterClass {
    return Adapter.isPrototypeOf.call(Adapter, Obj);
  }

  static isDatabaseClass(Obj: object): Obj is DatabaseClass {
    return Database.isPrototypeOf.call(Database, Obj);
  } */

  private static handleFunction(func: ModuleInstanceFunction, ctx: Context, config: object) {
    func(ctx, config);
  }

  private static handleCconstructor(Class: ModuleInstanceClass, ctx: Context, config: object) {
    none(new Class(ctx, config));
  }

  private static checkConfig(schema: unknown, config: object) {
    const resultSchema1 = moduleConfigBaseSchema.parseSafe(config);
    if (!resultSchema1.value) return resultSchema1.error;
    if (!(schema instanceof Parser)) return resultSchema1.data;
    const resultSchema2 = (schema as typeof moduleConfigBaseSchema).parseSafe(resultSchema1.data);
    if (resultSchema2 && !resultSchema2.value) return resultSchema2.error;
    return resultSchema2.data;
  }

  private handleObj(modules: ModuleInstance, config: object) {
    /* before handle */
    /* if (exportObj.lang) {
      ctxni18n.use(exportObj.lang instanceof Array ? resolve(...exportObj.lang) : resolve(exportObj.lang));
    } */
    const moduleName = modules.package.name;
    /* handle */
    /* service */
    // if (this.isServiceConsructor(moduleMethod)) {
    //   /* adapter */
    //   const adapterName = modulesName.split(ADAPTER_PREFIX)[1];
    //   const databaseName = modulesName.split(DATABASE_PREFIX)[1];
    //   if (adapterName && this.isAdapterClass(moduleMethod)) {
    //     ctx.serviceStack[adapterName] = [moduleMethod, schema];
    //   } else if (databaseName && this.isDatabaseClass(moduleMethod)) {
    //     /* here need more service type support... */
    //   }
    //   return undefined;
    // }
    /* plugin */
    const moduleConfig = Modules.checkConfig(modules.exports.schema, config);
    if (moduleConfig instanceof TsuError)
      return new ModuleError(`Config format of module ${moduleName} is error: ${moduleConfig.message}`);
    if (modules.exports.default !== undefined) {
      if (isClass(modules.exports.default)) {
        return Modules.handleCconstructor(modules.exports.default, this.ctx, moduleConfig);
      }
      if (modules.exports.default instanceof Function) {
        return Modules.handleFunction(modules.exports.default, this.ctx, moduleConfig);
      }
      return new DevError(`Module instance of default export is not function or constructor at ${moduleName}`);
    }
    if (modules.exports.main instanceof Function) {
      if (isClass(modules.exports.main)) {
        return new DevError(`Module instance is constructor,export name should be 'Main' not 'main' at ${moduleName}`);
      }
      return Modules.handleFunction(modules.exports.main, this.ctx, moduleConfig);
    }
    if (modules.exports.Main instanceof Function) {
      if (!isClass(modules.exports.Main)) {
        return new DevError(`Module instance is function,export name should be 'main' not 'Main' at ${moduleName}`);
      }
      return Modules.handleCconstructor(modules.exports.Main, this.ctx, moduleConfig);
    }
    return undefined;
  }

  private readonly ctx: Context;

  constructor(ctx: Context) {
    this.ctx = ctx;
  }

  load(modules: ModuleInstance | ModuleInstanceFunction | ModuleInstanceClass, config: object = {}) {
    if (modules instanceof Function) {
      if (isClass(modules)) return Modules.handleCconstructor(modules, this.ctx, {});
      return Modules.handleFunction(modules as ModuleInstanceFunction, this.ctx, {});
    }

    const error = this.handleObj(modules, config);
    this.ctx.emit('ready', { module: modules });
    if (error) this.ctx.emit('error', { error });
    return undefined;
  }

  dispose(modules: /*  string | */ ModuleInstance) {
    modules.fileList.forEach((file) => delete require.cache[require.resolve(file)]);
    this.ctx.emit('dispose', { module: modules });
  }
}

export default Modules;
