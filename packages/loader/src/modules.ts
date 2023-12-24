import fs from 'fs';
import path from 'path';
import {
  Context,
  DevError,
  ModuleData,
  ModulePackage,
  ModulePackageSchema,
  OFFICIAL_MODULES_SCOPE,
  PLUGIN_PREFIX,
  stringRightSplit,
} from 'kotori-bot';
import { BUILD_FILE, DEV_CODE_DIRS, DEV_FILE, DEV_IMPORT } from './consts';

declare module 'kotori-bot' {
  interface Context {
    readonly moduleAll?: () => void;
    readonly watchFile?: () => void;
  }
}

export class Modules extends Context {
  private isDev = this.options.env === 'dev';

  private readonly moduleRootDir: string[] = [];

  private getDirFiles(rootDir: string) {
    const files = fs.readdirSync(rootDir);
    const list: string[] = [];
    files.forEach(fileName => {
      const file = path.join(rootDir, fileName);
      if (fs.statSync(file).isDirectory()) {
        list.push(...this.getDirFiles(file));
      }
      if (path.parse(file).ext !== (this.isDev ? DEV_FILE : BUILD_FILE)) return;
      list.push(path.resolve(file));
    });
    return list;
  }

  private getModuleRootDir() {
    Object.assign(this.config.global.dirs, [this.baseDir.modules]).forEach(dir => {
      if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) this.moduleRootDir.push(dir);
    });
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
        throw new DevError(`illegal package.json ${packagePath}`);
      }
      if (!ModulePackageSchema.check(packageJson)) {
        if (rootDir !== this.baseDir.modules) return;
        throw new DevError(`package.json format error ${packagePath}`);
      }
      const mainPath = path.join(dir, this.isDev ? DEV_IMPORT : packageJson.main);
      if (!fs.existsSync(mainPath)) throw new DevError(`cannot find ${mainPath}`);
      const codeDirs = path.join(dir, this.isDev ? DEV_CODE_DIRS : path.dirname(packageJson.main));
      this.moduleStack.push({
        package: packageJson,
        fileList: fs.statSync(codeDirs).isDirectory() ? this.getDirFiles(codeDirs) : [],
        mainPath: path.resolve(mainPath),
      });
    });
  }

  private moduleQuick(moduleData: ModuleData) {
    return this.use(
      moduleData,
      this,
      this.config.plugin[stringRightSplit(moduleData.package.name, PLUGIN_PREFIX)] ?? {},
    );
  }

  public readonly moduleAll = async () => {
    this.getModuleRootDir();
    this.moduleRootDir.forEach(dir => {
      this.getModuleList(dir);
    });
    const array = this.moduleStack.filter(data => data.package.name.startsWith(OFFICIAL_MODULES_SCOPE));
    array.push(...this.moduleStack.filter(data => !array.includes(data)));
    array.forEach(moduleData => this.moduleQuick(moduleData));
  };

  public readonly watchFile = async () => {
    this.moduleStack.forEach(moduleData =>
      moduleData.fileList.forEach(file =>
        fs.watchFile(file, () => (this.dispose(moduleData) as unknown) && this.moduleQuick(moduleData)),
      ),
    );
  };
}

export default Modules;
