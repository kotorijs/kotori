import { isClass, isObj, none } from '@kotori-bot/tools';
import fs from 'fs';
import path from 'path';
import KotoriError from './errror';
import Events from './events';
import Content from './content';
import Adapter from './adapter';
import { AdapterEntity, ModuleData, ModuleEntityClass, ModuleEntityFunc, ModuleService } from './types';

const ModuleError = new KotoriError(undefined, 'ModuleError', 'normal').extend();
export class Modules extends Events {
	private moduleCurrent: string | 'core' = 'core';

	private alreadyModuleNum = 0;

	protected getModuleCurrent = () => this.moduleCurrent;

	private setModuleCureent = (value?: string) => {
		const defaultValue = 'core';
		return new Promise((resolve, reject) => {
			if (!value) {
				this.moduleCurrent = defaultValue;
				resolve(null);
				return;
			}
			const failTime = setTimeout(() => {
				clearTimeout(failTime);
				clearInterval(sleepTime);
				reject(new ModuleError(`Module loading timeout ${value}`));
			}, 10 * 1000);
			const sleepTime = setInterval(() => {
				if (this.moduleCurrent === defaultValue) {
					this.moduleCurrent = value;
					clearTimeout(failTime);
					clearInterval(sleepTime);
					resolve(null);
				}
			}, 150);
		});
	};

	private loadEntity = (
		Entity: ModuleEntityFunc | ModuleEntityClass,
		moduleObj: string | ModuleData,
	): ModuleService => {
		if (isClass(Entity)) {
			const func = (Obj: object): Obj is AdapterEntity => Adapter.isPrototypeOf.call(Adapter, Obj);
			const prefix = 'kotori-plugin-adapter-';
			const adapterName = typeof moduleObj === 'string' ? moduleObj : moduleObj.package.name.split(prefix)[1];
			if (adapterName && func(Entity)) {
				this.adapterStack[adapterName] = Entity;
				return 'adapter';
			}
			none(new Entity(Content));
		} else {
			Entity(Content);
		}
		return 'plugin';
	};

	protected readonly moduleStack: ModuleData[] = [];

	public module = async (moduleObj: string | ModuleData | ModuleEntityFunc | ModuleEntityClass) => {
		let service: ModuleService = 'plugin';
		const isString = typeof moduleObj === 'string';
		const isFunc = moduleObj instanceof Function;

		try {
			if (moduleObj instanceof Function) {
				service = this.loadEntity(moduleObj, '');
			} else {
				const modulePath = isString ? moduleObj : moduleObj.mainPath;
				if (isString && !fs.existsSync(moduleObj)) throw new ModuleError(`cannot find ${path}`);
				await this.setModuleCureent(modulePath);
				const moduleObject = await import(modulePath);
				if (!isObj(moduleObject)) return;
				if (moduleObject.default instanceof Function) {
					service = this.loadEntity(moduleObject.default, moduleObj);
				} else if (moduleObject.main instanceof Function && !isClass(moduleObject.main)) {
					moduleObject.main(Content);
					service = 'plugin';
				} else if (moduleObject.Main instanceof Function && isClass(moduleObject.Main)) {
					service = this.loadEntity(moduleObject.Main, moduleObj);
				} else {
					throw new ModuleError(`Not a valid module ${modulePath}`);
				}
			}
		} catch (err) {
			this.setModuleCureent();
			throw err;
		}

		this.setModuleCureent();
		if (moduleObj instanceof Object) this.alreadyModuleNum += 1;
		/* Emit event */
		this.emit({
			type: 'load_module',
			module: isString || isFunc ? null : moduleObj,
			service,
		});
		if (
			moduleObj === this.moduleStack[this.moduleStack.length - 1] ||
			this.alreadyModuleNum >= this.moduleStack.length
		) {
			this.alreadyModuleNum = -1;
			this.emit({ type: 'load_all_module', count: this.moduleStack.length });
		}
	};

	public delcache = (module: string | ModuleData) => {
		/* need more... */
		const isString = typeof module === 'string';
		const modulePath = isString ? module : module.mainPath;
		this.emit({
			type: 'unload_module',
			module: isString ? null : module,
		});
		if (!isString) {
			module.fileList.forEach(file => delete require.cache[require.resolve(file)]);
			for (let index = 0; index < this.moduleStack.length; index += 1) {
				if (this.moduleStack[index] === module) delete this.moduleStack[index];
			}
		}
		delete require.cache[require.resolve(modulePath)];
	};
}

export default Modules;
