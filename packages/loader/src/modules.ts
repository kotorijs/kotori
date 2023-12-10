import fs from 'fs';
import path from 'path';
import { Context, ModuleData, ModuleError, ModulePackage, ModulePackageSchema, stringRightSplit } from 'kotori-bot';

declare module 'kotori-bot' {
	interface Context {
		readonly moduleAll?: () => void;
		readonly watchFile?: () => void;
	}
}

export class Modules extends Context {
	private readonly moduleRootDir: string[] = [];

	private getDirFiles(rootDir: string) {
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
	}

	private getModuleRootDir() {
		if (fs.existsSync(this.baseDir.modules)) this.moduleRootDir.push(this.baseDir.modules);
		// if (fs.existsSync(path.join(this.baseDir.root!, 'node_modules'))) {
		// 	this.moduleRootDir.push(path.join(this.baseDir.root, 'node_modules'));
		// } questions
	}

	private getModuleList(rootDir: string) {
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
			if (!ModulePackageSchema.check(packageJson)) {
				throw new ModuleError(`package.json format error ${packagePath}`);
			}
			const mainPath = path.join(dir, packageJson.main);
			if (!fs.existsSync(mainPath)) throw new ModuleError(`cannot find ${mainPath}`);
			this.moduleStack.push({
				package: packageJson,
				fileList: fs.statSync(path.join(dir, 'src')).isDirectory() ? this.getDirFiles(path.join(dir, 'src')) : [],
				mainPath: path.resolve(mainPath),
			});
		});
	}

	private moduleQuick(moduleData: ModuleData) {
		return this.module(
			moduleData,
			this,
			this.config.plugin[stringRightSplit(moduleData.package.name, 'kotori-plugin-')] ?? {},
		);
	}

	public readonly moduleAll = async () => {
		this.getModuleRootDir();
		this.moduleRootDir.forEach(dir => {
			this.getModuleList(dir);
		});
		/* here need update(question) */
		const array = this.moduleStack.filter(data => data.package.name.startsWith('@kotori-bot/'));
		array.push(...this.moduleStack.filter(data => !array.includes(data)));
		array.forEach(moduleData => this.moduleQuick(moduleData));
	};

	public readonly watchFile = async () => {
		this.moduleStack.forEach(moduleData =>
			moduleData.fileList.forEach(file =>
				fs.watchFile(file, () => (this.delcache(moduleData) as unknown) && this.moduleQuick(moduleData)),
			),
		);
	};
}

export default Modules;
