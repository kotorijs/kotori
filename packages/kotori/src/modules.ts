import { isClass, isObj, none, stringProcess } from '@kotori-bot/tools';
import fs from 'fs';
import path from 'path';
import KotoriError from './errror';
import Events, { eventDataLoadModule } from './events';
import Mixed from './mixed';
import Adapter, { AdapterType } from './adapter';

export interface ImodulePackage {
	name: string;
	version: string;
	description: string;
	main: string;
	license: 'GPL-3.0';
	author: string | string[];
	peerDependencies: {
		'kotori-bot': string;
	};
}

export interface ImoduleStack {
	package: ImodulePackage;
	fileList: string[];
	mainPath: string;
}

const checkPackageJson = (json: any): json is ImodulePackage => {
	const isStr = (val: any): val is string => val && typeof val === 'string';
	const baseInfo =
		isStr(json.name) && isStr(json.version) && isStr(json.description) && isStr(json.main) && json.peerDependencies;
	if (!baseInfo) return false;
	if (json.license !== 'GPL-3.0') return false;
	if (!isObj(json.peerDependencies) || !isStr(json.peerDependencies['kotori-bot'])) return false;
	if (isStr(json.author)) return true;
	if (!Array.isArray(json.author) || json.author.length < 1) return false;
	for (const element of json.author) {
		if (!isStr(element)) return false;
	}
	return true;
};

const ModuleError = new KotoriError(undefined, 'ModuleError', 'debug').extend();

export class Modules extends Events {
	private static readonly moduleStack: ImoduleStack[] = [];

	private static readonly moduleRootDir: string[] = [];

	private static moduleCurrent: string | 'core' = 'core';

	private static alreadyModuleNum = 0;

	private static readonly getDirFiles = (rootDir: string) => {
		const files = fs.readdirSync(rootDir);
		const list: string[] = [];
		files.forEach(fileName => {
			const file = path.join(rootDir, fileName);
			if (fs.statSync(file).isDirectory()) {
				list.push(...this.getDirFiles(file));
			}
			if (path.parse(file).ext !== '.ts') return;
			list.push(path.resolve(file));
		});
		return list;
	};

	private static readonly getModuleRootDir = () => {
		if (fs.existsSync(this.baseDir.MODULES)) this.moduleRootDir.push(this.baseDir.MODULES);
		if (fs.existsSync(path.join(this.baseDir.ROOT, 'node_modules/@kotori-bot'))) {
			this.moduleRootDir.push(path.join(this.baseDir.ROOT, 'node_modules/@kotori-bot'));
		}
	};

	private static readonly getModuleList = (rootDir: string) => {
		const files = fs.readdirSync(rootDir);
		files.forEach(fileName => {
			const dir = path.join(rootDir, fileName);
			if (!fs.statSync(dir).isDirectory()) return;
			const packagePath = path.join(dir, 'package.json');
			let packageJson: ImodulePackage;
			if (!fs.existsSync(packagePath)) return;
			try {
				packageJson = JSON.parse(fs.readFileSync(packagePath).toString());
			} catch {
				throw new ModuleError(`illegal package.json ${packagePath}`);
			}
			if (!checkPackageJson(packageJson)) throw new ModuleError(`package.json format error ${packagePath}`);
			if (!stringProcess(packageJson.name, '@kotori-bot/plugin-')) return;
			const mainPath = path.join(dir, packageJson.main);
			if (!fs.existsSync(mainPath)) throw new ModuleError(`cannot find ${mainPath}`);
			this.moduleStack.push({
				package: packageJson,
				fileList: fs.statSync(path.join(dir, 'src')).isDirectory()
					? this.getDirFiles(path.join(dir, 'src'))
					: [],
				mainPath: path.resolve(mainPath),
			});
		});
	};

	protected static readonly watchFile = () => {
		this.moduleStack.forEach(module =>
			module.fileList.forEach(file =>
				fs.watchFile(file, () => {
					this.delcache(module);
					this.module(module);
				}),
			),
		);
	};

	protected static readonly moduleAll = async () => {
		this.getModuleRootDir();
		this.moduleRootDir.forEach(dir => {
			this.getModuleList(dir);
		});
		for (const module of this.moduleStack) {
			this.module(module);
		}
	};

	protected static getModuleCurrent = () => this.moduleCurrent;

	private static setModuleCureent = (value?: string) => {
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

	private static loadClass = (
		Value: new (...args: unknown[]) => unknown,
		moduleObj: string | ImoduleStack,
	): eventDataLoadModule['service'] => {
		const func = (Obj: object): Obj is AdapterType => Adapter.isPrototypeOf.call(Adapter, Obj);
		const prefix = '@kotori-bot/plugin-adapter-';
		const adapterName = moduleObj instanceof Object ? moduleObj.package.name.split(prefix)[1] : '';
		if (adapterName && func(Value)) {
			this.AdapterStack[adapterName] = Value;
			return 'adapter';
		}
		none(new Value(Mixed));
		return '';
	};

	public static module = async (moduleObj: string | ImoduleStack) => {
		const moduleType = typeof moduleObj === 'string';
		const modulePath = moduleType ? moduleObj : moduleObj.mainPath;
		let service: eventDataLoadModule['service'] = '';
		if (!moduleType) this.alreadyModuleNum += 1;

		if (moduleType && !fs.existsSync(moduleObj)) throw new ModuleError(`cannot find ${path}`);
		await this.setModuleCureent(modulePath);
		try {
			const moduleObject = await import(modulePath);
			if (!isObj(moduleObject)) return;
			const Enter = moduleObject.default;
			if (Enter instanceof Function) {
				if (isClass(Enter)) service = this.loadClass(Enter, moduleObj);
				else Enter(Mixed);
			} else if (moduleObject.main instanceof Function && !isClass(moduleObject.main)) {
				moduleObject.main(Mixed);
			} else if (moduleObject.Main instanceof Function && isClass(moduleObject.Main)) {
				service = this.loadClass(moduleObject.Main, moduleObj);
			}
		} catch (err) {
			this.setModuleCureent();
			throw err;
		}
		this.setModuleCureent();

		/* Emit event */
		Events.emit({
			type: 'load_module',
			module: moduleType ? null : moduleObj,
			service,
		});
		if (this.alreadyModuleNum >= this.moduleStack.length) {
			this.alreadyModuleNum = -1;
			this.emit({ type: 'load_all_module', count: this.moduleStack.length });
		}
	};

	public static delcache = (module: string | ImoduleStack) => {
		const moduleType = typeof module === 'string';
		const modulePath = moduleType ? module : module.mainPath;
		Events.emit({
			type: 'unload_module',
			module: moduleType ? null : module,
		});
		if (!moduleType) {
			module.fileList.forEach(file => delete require.cache[require.resolve(file)]);
			for (let index = 0; index < this.moduleStack.length; index += 1) {
				if (this.moduleStack[index] === module) delete this.moduleStack[index];
			}
		}
		delete require.cache[require.resolve(modulePath)];
	};
}

export default Modules;
// 获取初始的所有插件entry
// const entries = getPluginEntries(pluginRoot);

// 监听所有entry的变化
/* entries.forEach(entry => {
	
}); */
