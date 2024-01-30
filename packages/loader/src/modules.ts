import fs from 'fs';
import path from 'path';
import {
  ADAPTER_PREFIX,
  CORE_MODULES,
  CUSTOM_PREFIX,
  Context,
  DATABASE_PREFIX,
  DevError,
  ModuleData,
  ModulePackage,
  ModulePackageSchema,
  OFFICIAL_MODULES_SCOPE,
  PLUGIN_PREFIX,
  clearObject,
  none,
  stringRightSplit
} from '@kotori-bot/core';
import { BUILD_FILE, DEV_CODE_DIRS, DEV_FILE, DEV_IMPORT } from './consts';

declare module '@kotori-bot/core' {
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
    files.forEach((fileName) => {
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
    Object.assign(this.config.global.dirs, [this.baseDir.modules]).forEach((dir) => {
      if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) this.moduleRootDir.push(dir);
    });
  }

  private getModuleList(rootDir: string) {
    const files = fs.readdirSync(rootDir);
    files.forEach((fileName) => {
      const dir = path.join(rootDir, fileName);
      if (!fs.statSync(dir).isDirectory()) return;
      if (rootDir !== this.baseDir.modules && fileName.startsWith(PLUGIN_PREFIX)) return;
      const packagePath = path.join(dir, 'package.json');
      let packageJson: ModulePackage;
      if (!fs.existsSync(packagePath)) return;
      try {
        packageJson = JSON.parse(fs.readFileSync(packagePath).toString());
      } catch {
        throw new DevError(`illegal package.json ${packagePath}`);
      }
      const result = ModulePackageSchema.parseSafe(packageJson);
      if (!result.value) {
        if (rootDir !== this.baseDir.modules) return;
        throw new DevError(`package.json format error ${packagePath}: ${result.error.message}`);
      }
      packageJson = result.data;
      const mainPath = path.join(dir, this.isDev ? DEV_IMPORT : packageJson.main);
      if (!fs.existsSync(mainPath)) throw new DevError(`cannot find ${mainPath}`);
      const codeDirs = path.join(dir, this.isDev ? DEV_CODE_DIRS : path.dirname(packageJson.main));
      this.moduleStack.push({
        package: packageJson,
        config: Object.assign(
          packageJson.kotori.config || {},
          clearObject(this.config.plugin[stringRightSplit(packageJson.name, PLUGIN_PREFIX)] || {})
        ),
        fileList: fs.statSync(codeDirs).isDirectory() ? this.getDirFiles(codeDirs) : [],
        mainPath: path.resolve(mainPath)
      });
    });
  }

  private moduleQuick(moduleData: ModuleData) {
    this.use(moduleData, this, moduleData.config);
  }

  readonly moduleAll = async () => {
    this.getModuleRootDir();
    this.moduleRootDir.forEach((dir) => {
      this.getModuleList(dir);
    });
    const handle = (pkg: ModulePackage) => {
      if (pkg.name.includes(DATABASE_PREFIX)) return 1;
      if (pkg.name.includes(ADAPTER_PREFIX)) return 2;
      if (CORE_MODULES.includes(pkg.name)) return 3;
      if (pkg.kotori.enforce === 'pre') return 4;
      if (!pkg.kotori.enforce) return 5;
      return 5;
    };
    this.moduleStack
      .sort((el1, el2) => handle(el1.package) - handle(el2.package))
      .forEach((moduleData) => {
        this.moduleQuick(moduleData);
      });
  };

  readonly watchFile = async () => {
    /* this.moduleStack.forEach(moduleData =>
      moduleData.fileList.forEach(file =>
        fs.watchFile(file, () => (this.dispose(moduleData) as unknown) && this.moduleQuick(moduleData)),
      ),
    ); */
    none(this);
  };
}

export default Modules;
