import { isClass, none } from '@kotori-bot/tools';
import fs from 'fs';
import Tsu, { Parser } from 'tsukiko';
import Events from './events';
import Context from '../context';
import Adapter from '../components/adapter';
import {
  type AdapterConstructor,
  type ModuleData,
  type ModuleInstanceConstructor,
  type ModuleInstanceFunction,
  type ModuleInstanceType,
  type ModuleType,
} from '../types';
import { DevError, ModuleError } from '../utils/errror';
import { ADAPTER_PREFIX, LOAD_MODULE_MAX_TIME, LOAD_MODULE_SLEEP_TIME } from '../consts';

function getTypeInfo(Instance: ModuleInstanceFunction | ModuleInstanceConstructor | unknown, moduleName: string) {
  let type: ModuleType = 'plugin';
  let instanceType: ModuleInstanceType = 'none';
  if (isClass(Instance)) {
    instanceType = 'constructor';
    const func = (Obj: object): Obj is AdapterConstructor => Adapter.isPrototypeOf.call(Adapter, Obj);
    const adapterName = moduleName.split(ADAPTER_PREFIX)[1];
    if (adapterName && func(Instance)) {
      type = 'adapter';
      return { type, instanceType, moduleName, adapterName };
    }
  } else if (Instance instanceof Function) {
    instanceType = 'function';
    return { type, instanceType, moduleName };
  }
  return { type, instanceType, moduleName };
}

export class Modules extends Events {
  private current: string | 'core' = 'core';

  private failedLoadCount = 0;

  protected getCurrent() {
    return this.current;
  }

  private setCureent(value?: string) {
    const defaultValue = 'core';
    return new Promise((resolve, reject) => {
      if (!value) {
        this.current = defaultValue;
        resolve(null);
        return;
      }
      const failTime = setTimeout(() => {
        clearTimeout(failTime);
        clearInterval(sleepTime);
        reject(new ModuleError(`Module loading timeout ${value}`));
      }, LOAD_MODULE_MAX_TIME);
      const sleepTime = setInterval(() => {
        if (this.current === defaultValue) {
          this.current = value;
          clearTimeout(failTime);
          clearInterval(sleepTime);
          resolve(null);
        }
      }, LOAD_MODULE_SLEEP_TIME);
    });
  }

  private runInstance(
    typeInfo: ReturnType<typeof getTypeInfo>,
    Instances: [ModuleInstanceFunction | ModuleInstanceConstructor | unknown, Parser<unknown>?],
    data: {
      args: [Context, object];
      langDir?: string;
    },
  ) {
    /* before handle */
    if (data.langDir) data.args[0].i18n.use(data.langDir);

    /* after handle */
    if (typeInfo.type === 'adapter') {
      this.adapterStack[typeInfo.adapterName] = [Instances[0] as AdapterConstructor, Instances[1]];
      return;
    }
    if (typeInfo.instanceType === 'none') return;
    /* Check config */
    const isSchema = Instances[1]?.parseSafe(data.args[1]);
    if (isSchema && !isSchema.value) {
      throw new ModuleError(`Config format of module ${typeInfo.moduleName} is error`);
    }
    if (typeInfo.instanceType === 'constructor') {
      none(new (Instances[0] as ModuleInstanceConstructor)(...data.args));
      return;
    }
    (Instances[0] as ModuleInstanceFunction)(...data.args);
  }

  private moduleAllHandle() {
    this.emit('load_all_module', {
      reality: this.moduleStack.length - this.failedLoadCount,
      expected: this.moduleStack.length,
    });
  }

  protected readonly moduleStack: ModuleData[] = [];

  public async use(
    summary: string | ModuleData | ModuleInstanceFunction | ModuleInstanceConstructor,
    ctx: Context,
    config: object,
  ) {
    const isString = typeof summary === 'string';
    const isFunc = summary instanceof Function;
    let Instance;
    let typeInfo: ReturnType<typeof getTypeInfo>;
    let exportObj;

    const isLast = !isString && !isFunc && summary === this.moduleStack[this.moduleStack.length - 1];
    try {
      if (isFunc) {
        typeInfo = getTypeInfo(summary, '');
        Instance = summary;
        exportObj = null;
      } else {
        const moduleName = isString ? summary : summary.package.name;
        const modulePath = `file://${isString ? summary : summary.mainPath}`;
        if (isString && !fs.existsSync(summary)) throw new ModuleError(`Cannot find ${modulePath}`);
        await this.setCureent(modulePath);
        exportObj = await import(modulePath);
        if (!Tsu.Object({}).index(Tsu.Unknown()).check(exportObj)) {
          throw new DevError(`Not a valid module at ${modulePath}`);
        }
        exportObj = Tsu.Object({}).index(Tsu.Unknown()).check(exportObj.default) ? exportObj.default : exportObj;

        if (exportObj.default instanceof Function) {
          typeInfo = getTypeInfo(exportObj.default, moduleName);
          Instance = exportObj.default;
        } else if (exportObj.main instanceof Function && !isClass(exportObj.main)) {
          typeInfo = getTypeInfo(exportObj.main, moduleName);
          Instance = exportObj.main;
          if (typeInfo.instanceType !== 'function') {
            throw new DevError(`Module instance is function,export name should be 'main' at ${modulePath}`);
          }
        } else if (exportObj.Main instanceof Function && isClass(exportObj.Main)) {
          typeInfo = getTypeInfo(exportObj.Main, moduleName);
          Instance = exportObj.Main;
          if (typeInfo.instanceType !== 'constructor') {
            throw new DevError(`Module instance is constructor,export name should be 'Main' at ${modulePath}`);
          }
        } else {
          typeInfo = getTypeInfo(null, moduleName);
          Instance = null;
        }
      }
      const schema = exportObj && exportObj.config instanceof Parser ? exportObj.config : undefined;
      this.runInstance(typeInfo, [Instance, schema], {
        args: [
          /* wait for logger updated after hered need new 功能 about print module of name */
          /* Object.assign(ctx, {
            logger: ctx.logger.tag(stringRightSplit(typeInfo.moduleName, PLUGIN_PREFIX), 'italic', 'white'),
          }) */ ctx,
          config,
        ],
        langDir: exportObj && typeof exportObj.lang === 'string' ? exportObj.lang : undefined,
      });
    } catch (err) {
      this.setCureent();
      this.failedLoadCount += 1;
      if (isLast) this.moduleAllHandle();
      throw err;
    }
    this.setCureent();
    this.emit('load_module', {
      module: isString || isFunc ? null : summary,
      moduleType: typeInfo.type,
      instanceType: typeInfo.instanceType,
    });
    if (isLast) this.moduleAllHandle();
  }

  public dispose(module: string | ModuleData) {
    /* need more... */
    const isString = typeof module === 'string';
    const modulePath = isString ? module : module.mainPath;
    this.emit('unload_module', { module: isString ? null : module });
    if (!isString) {
      module.fileList.forEach(file => delete require.cache[require.resolve(file)]);
      for (let index = 0; index < this.moduleStack.length; index += 1) {
        if (this.moduleStack[index] === module) delete this.moduleStack[index];
      }
    }
    delete require.cache[require.resolve(modulePath)];
  }
}

export default Modules;
