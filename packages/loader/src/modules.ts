import fs from 'fs';
import path from 'path';
import {
  ADAPTER_PREFIX,
  CUSTOM_PREFIX,
  Context,
  DATABASE_PREFIX,
  DEFAULT_ADAPTER_PRIORITY,
  DEFAULT_CUSTOM_PRIORITY,
  DEFAULT_DATABASE_PRIORITY,
  DEFAULT_PRIORITY,
  DevError,
  ModuleData,
  ModulePackage,
  ModulePackageSchemaController,
  OFFICIAL_MODULES_SCOPE,
  PLUGIN_PREFIX,
  clearObject,
  none,
  stringRightSplit,
} from '@kotori-bot/core';
import { BUILD_FILE, DEV_CODE_DIRS, DEV_FILE, DEV_IMPORT } from './consts';

declare module '@kotori-bot/core' {
  interface Context {
    readonly moduleAll?: () => void;
    readonly watchFile?: () => void;
  }
}

function getDefaultPriority(pkgName: string) {
  if (pkgName.includes(DATABASE_PREFIX)) return DEFAULT_DATABASE_PRIORITY;
  if (pkgName.includes(ADAPTER_PREFIX)) return DEFAULT_ADAPTER_PRIORITY;
  if (pkgName.includes(CUSTOM_PREFIX)) return DEFAULT_CUSTOM_PRIORITY;
  return DEFAULT_PRIORITY;
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
      if (rootDir !== this.baseDir.modules && fileName.startsWith(PLUGIN_PREFIX)) return;
      const packagePath = path.join(dir, 'package.json');
      let packageJson: ModulePackage;
      if (!fs.existsSync(packagePath)) return;
      try {
        packageJson = JSON.parse(fs.readFileSync(packagePath).toString());
      } catch {
        throw new DevError(`illegal package.json ${packagePath}`);
      }
      const result = ModulePackageSchemaController().parseSafe(packageJson);
      if (!result.value) {
        if (rootDir !== this.baseDir.modules) return;
        throw new DevError(`package.json format error ${packagePath}: ${result.error.message}`);
      }
      packageJson = ModulePackageSchemaController(getDefaultPriority(this.package.name), {}).parse(result.data);
      const mainPath = path.join(dir, this.isDev ? DEV_IMPORT : packageJson.main);
      if (!fs.existsSync(mainPath)) throw new DevError(`cannot find ${mainPath}`);
      const codeDirs = path.join(dir, this.isDev ? DEV_CODE_DIRS : path.dirname(packageJson.main));
      this.moduleStack.push({
        package: packageJson,
        config: Object.assign(
          packageJson.kotori.config || {},
          clearObject(this.config.plugin[stringRightSplit(packageJson.name, PLUGIN_PREFIX)] || {}),
        ),
        fileList: fs.statSync(codeDirs).isDirectory() ? this.getDirFiles(codeDirs) : [],
        mainPath: path.resolve(mainPath),
      });
    });
  }

  private moduleQuick(moduleData: ModuleData) {
    this.use(moduleData, this, moduleData.config);
  }

  public readonly moduleAll = async () => {
    this.getModuleRootDir();
    this.moduleRootDir.forEach(dir => {
      this.getModuleList(dir);
    });
    const array = this.moduleStack.filter(data => data.package.name.startsWith(OFFICIAL_MODULES_SCOPE));
    array.push(...this.moduleStack.filter(data => !array.includes(data)));
    array.forEach(moduleData => {
      this.moduleQuick(moduleData);
    });
  };

  public readonly watchFile = async () => {
    /* this.moduleStack.forEach(moduleData =>
      moduleData.fileList.forEach(file =>
        fs.watchFile(file, () => (this.dispose(moduleData) as unknown) && this.moduleQuick(moduleData)),
      ),
    ); */
    none(this);
  };
}

export default Modules;
