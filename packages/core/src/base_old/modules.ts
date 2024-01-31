import { isClass, none } from '@kotori-bot/tools';
import fs from 'fs';
import { Parser, TsuError } from 'tsukiko';
import { resolve } from 'path';
import Context from '../context';
import Adapter from '../components/adapter';
import {
  type ServiceClass,
  type AdapterClass,
  type ModuleInstance,
  type ModuleInstanceClass,
  type ModuleInstanceFunction,
  DatabaseClass
} from '../types2';
import { DevError, ModuleError } from '../utils/errror';
import { ADAPTER_PREFIX, DATABASE_PREFIX } from '../consts';
import Service from '../components/service';
import { Database } from '../components/database';
import Core from './core';

export class Modules extends Core {
  static isServiceConsructor(Obj: object): Obj is ServiceClass {
    return Service.isPrototypeOf.call(Service, Obj);
  }

  static isAdapterClass(Obj: object): Obj is AdapterClass {
    return Adapter.isPrototypeOf.call(Adapter, Obj);
  }

  static isDatabaseClass(Obj: object): Obj is DatabaseClass {
    return Database.isPrototypeOf.call(Database, Obj);
  }

  private static modulesFunction(func: ModuleInstanceFunction, ctx: Context, config: object) {
    func(ctx, config);
  }

  private static modulesCconstructor(Class: ModuleInstanceClass, ctx: Context, config: object) {
    none(new Class(ctx, config));
  }

  private static async modulesFile(modulesDir: string, modulesName: string, ctx: Context, config: object = {}) {
    if (!fs.existsSync(modulesDir)) return new ModuleError(`Cannot find ${modulesName}`);
    let exportObj;
    let modulesConfig = config;
    try {
      exportObj = (await import(`file://${modulesDir}`)).default;
      /* it's so fucked, here need fix... */
    } catch (err) {
      return err;
    }
    /* before handle */
    if (exportObj.lang) {
      ctx.i18n.use(exportObj.lang instanceof Array ? resolve(...exportObj.lang) : resolve(exportObj.lang));
    }
    const schema = exportObj && exportObj.config instanceof Parser ? (exportObj.config as Parser<object>) : undefined;
    /* handle */
    if (exportObj.default !== undefined) {
      /* service */
      if (this.isServiceConsructor(exportObj.default)) {
        /* adapter */
        const adapterName = modulesName.split(ADAPTER_PREFIX)[1];
        const databaseName = modulesName.split(DATABASE_PREFIX)[1];
        if (adapterName && this.isAdapterClass(exportObj.default)) {
          ctx.serviceStack[adapterName] = [exportObj.default, schema];
        } else if (databaseName && this.isDatabaseClass(exportObj.default)) {
          /* here need more service type support... */
        }
        return undefined;
      }
      /* plugin: check config */
      if (schema) {
        const resultSchema = schema.parseSafe(config);
        if (!resultSchema.value) return resultSchema.error;
        modulesConfig = resultSchema.data;
      }
      /* plugin */
      if (isClass(exportObj.default)) return this.modulesCconstructor(exportObj.default, ctx, modulesConfig);
      if (exportObj.default instanceof Function) return this.modulesFunction(exportObj.default, ctx, modulesConfig);
      return new DevError(`Module instance of default export is not function or constructor at ${modulesName}`);
    }

    if (exportObj.main instanceof Function) {
      if (isClass(exportObj.main)) {
        return new DevError(`Module instance is constructor,export name should be 'Main' not 'main' at ${modulesName}`);
      }
      return this.modulesFunction(exportObj.main, ctx, modulesConfig);
    }
    if (exportObj.Main instanceof Function) {
      if (!isClass(exportObj.Main)) {
        return new DevError(`Module instance is function,export name should be 'main' not 'Main' at ${modulesName}`);
      }
      return this.modulesCconstructor(exportObj.Main, ctx, modulesConfig);
    }
    return undefined;
  }

  private failedLoadCount = 0;

  private emitModuleEvent(modules: ModuleInstance | null, result: boolean, isLast: boolean) {
    if (!result) this.failedLoadCount += 1;
    this.emit('ready', { module: modules, result });
    if (!isLast) return;
    this.emit('ready_all', {
      reality: this.moduleStack.length - this.failedLoadCount,
      expected: this.moduleStack.length
    });
  }

  protected readonly moduleStack: ModuleInstance[] = [];

  async use(
    modules: string | ModuleInstance | ModuleInstanceFunction | ModuleInstanceClass,
    ctx: Context = this as unknown as Context,
    config: object = {}
  ) {
    const isString = typeof modules === 'string';
    const isFunc = modules instanceof Function;
    const isLast = isString || isFunc ? false : modules === this.moduleStack[this.moduleStack.length - 1];
    const handleModule = isString || isFunc ? null : modules;
    let err;
    if (isClass(modules)) Modules.modulesCconstructor(modules, ctx, config);
    else if (isFunc) Modules.modulesFunction(modules as ModuleInstanceFunction, ctx, config);
    else {
      const modulesDir = isString ? modules : modules.mainPath;
      const modulesName = isString ? modules : modules.package.name;
      err = await Modules.modulesFile(modulesDir, modulesName, ctx, config);
      if (err instanceof TsuError) {
        err = new ModuleError(`Config format of module ${modulesName} is error: ${err.message}`);
      }
    }
    this.emitModuleEvent(handleModule, !err, isLast);
    if (err) throw err;
  }

  dispose(module: string | ModuleInstance) {
    /* need more... */
    const isString = typeof module === 'string';
    const modulePath = isString ? module : module.mainPath;
    this.emit('dispose', { module: isString ? null : module });
    if (!isString) {
      module.fileList.forEach((file) => delete require.cache[require.resolve(file)]);
      for (let index = 0; index < this.moduleStack.length; index += 1) {
        if (this.moduleStack[index] === module) delete this.moduleStack[index];
      }
    }
    delete require.cache[require.resolve(modulePath)];
  }
}

export default Modules;
