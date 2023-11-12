import { isObj } from '@kotori-bot/tools';
import fs from 'fs';
import path from 'path';
import { Context, KotoriError, ModulePackage } from 'kotori-bot';

const checkPackageJson = (json: unknown): json is ModulePackage => {
	if (!isObj(json)) return false;
	const isStr = (val: unknown): val is string => !!val && typeof val === 'string';
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

const checkModuleName = (target: string) => !!/kotori-plugin-[a-z]([a-z,0-9]{3,13})\b/.exec(target);

const ModuleError = new KotoriError('', 'ModuleError', 'normal').extend();

export class Modules extends Context {
	private readonly moduleRootDir: string[] = [];

	private readonly getDirFiles = (rootDir: string) => {
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

	private readonly getModuleRootDir = () => {
		if (fs.existsSync(this.baseDir.modules)) this.moduleRootDir.push(this.baseDir.modules);
		if (fs.existsSync(path.join(this.baseDir.root!, 'node_modules'))) {
			this.moduleRootDir.push(path.join(this.baseDir.root, 'node_modules'));
		}
	};

	private readonly getModuleList = (rootDir: string) => {
		const files = fs.readdirSync(rootDir);
		files.forEach(fileName => {
			const dir = path.join(rootDir, fileName);
			if (!fs.statSync(dir).isDirectory()) return;
			const packagePath = path.join(dir, 'package.json');
			let packageJson: ModulePackage;
			if (!fs.existsSync(packagePath)) return;
			try {
				packageJson = JSON.parse(fs.readFileSync(packagePath).toString());
			} catch {
				throw new ModuleError(`illegal package.json ${packagePath}`);
			}
			if (!checkPackageJson(packageJson)) return;
			// if (!checkPackageJson(packageJson)) throw new ModuleError(`package.json format error ${packagePath}`);
			if (!checkModuleName(packageJson.name)) return;
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

	public readonly moduleAll = async () => {
		this.getModuleRootDir();
		this.moduleRootDir.forEach(dir => {
			this.getModuleList(dir);
		});
		for (const module of this.moduleStack) {
			this.module(module, this);
		}
	};

	public readonly watchFile = () => {
		this.moduleStack.forEach(module =>
			module.fileList.forEach(file =>
				fs.watchFile(file, () => {
					this.delcache(module);
					this.module(module, this);
				}),
			),
		);
	};

	public readonly getAdapters = this.adapterStack;
}

export default Modules;
