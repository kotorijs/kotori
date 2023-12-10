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

function getTypeInfo(Instance: ModuleInstanceFunction | ModuleInstanceConstructor | unknown, moduleName: string) {
	let type: ModuleType = 'plugin';
	let instanceType: ModuleInstanceType = 'none';
	if (isClass(Instance)) {
		instanceType = 'constructor';
		const func = (Obj: object): Obj is AdapterConstructor => Adapter.isPrototypeOf.call(Adapter, Obj);
		const prefix = 'kotori-plugin-adapter-';
		const adapterName = moduleName.split(prefix)[1];
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

	private failedLoadCount: number = 0;

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
			}, 10 * 1000);
			const sleepTime = setInterval(() => {
				if (this.current === defaultValue) {
					this.current = value;
					clearTimeout(failTime);
					clearInterval(sleepTime);
					resolve(null);
				}
			}, 150);
		});
	}

	private runInstance(
		typeInfo: ReturnType<typeof getTypeInfo>,
		exports: [ModuleInstanceFunction | ModuleInstanceConstructor | unknown, Parser<unknown>?],
		args: [Context, object],
	) {
		if (typeInfo.type === 'adapter') {
			this.adapterStack[typeInfo.adapterName] = [exports[0] as AdapterConstructor, exports[1]];
			return;
		}
		if (typeInfo.instanceType === 'none') return;
		/* Check config */
		const isSchema = exports[1]?.parseSafe(args[1]);
		if (isSchema && !isSchema.value) {
			throw new ModuleError(`Config format of module ${typeInfo.moduleName} is error`);
		}
		if (typeInfo.instanceType === 'constructor') {
			none(new (exports[0] as ModuleInstanceConstructor)(...args));
			return;
		}
		(exports[0] as ModuleInstanceFunction)(...args);
	}

	private moduleAllHandle() {
		this.emit('load_all_module', {
			reality: this.moduleStack.length - this.failedLoadCount,
			expected: this.moduleStack.length,
		});
	}

	protected readonly moduleStack: ModuleData[] = [];

	public async module(
		summary: string | ModuleData | ModuleInstanceFunction | ModuleInstanceConstructor,
		ctx: Context,
		config: object,
	) {
		const isString = typeof summary === 'string';
		const isFunc = summary instanceof Function;
		let Instance;
		let typeInfo: ReturnType<typeof getTypeInfo>;
		let exports;

		const isLast = !isString && !isFunc && summary === this.moduleStack[this.moduleStack.length - 1];
		try {
			if (isFunc) {
				typeInfo = getTypeInfo(summary, '');
				Instance = summary;
				exports = null;
			} else {
				const moduleName = isString ? summary : summary.package.name;
				const modulePath = `file://${isString ? summary : summary.mainPath}`;
				if (isString && !fs.existsSync(summary)) throw new ModuleError(`Cannot find ${modulePath}`);
				await this.setCureent(modulePath);
				exports = await import(modulePath);
				if (!Tsu.Object({}).index(Tsu.Unknown()).check(exports)) {
					throw new DevError(`Not a valid module at ${modulePath}`);
				}
				exports = Tsu.Object({}).index(Tsu.Unknown()).check(exports.default) ? exports.default : exports;

				if (exports.default instanceof Function) {
					typeInfo = getTypeInfo(exports.default, moduleName);
					Instance = exports.default;
				} else if (exports.main instanceof Function && !isClass(exports.main)) {
					typeInfo = getTypeInfo(exports.main, moduleName);
					Instance = exports.main;
					if (typeInfo.instanceType !== 'function') {
						throw new DevError(`Module instance is function,export name should be 'main' at ${modulePath}`);
					}
				} else if (exports.Main instanceof Function && isClass(exports.Main)) {
					typeInfo = getTypeInfo(exports.Main, moduleName);
					Instance = exports.Main;
					if (typeInfo.instanceType !== 'constructor') {
						throw new DevError(`Module instance is constructor,export name should be 'Main' at ${modulePath}`);
					}
				} else {
					typeInfo = getTypeInfo(null, moduleName);
					Instance = null;
				}
			}
			const schema = exports && exports.config instanceof Parser ? exports.config : undefined;
			this.runInstance(typeInfo, [Instance, schema], [ctx, config]);
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

	public delcache(module: string | ModuleData) {
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
