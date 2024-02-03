import fs, { existsSync } from 'fs';
import path from 'path';
import {
  ADAPTER_PREFIX,
  CORE_MODULES,
  Core,
  DATABASE_PREFIX,
  DevError,
  ModuleConfig,
  ModuleInstance,
  ModulePackage,
  PLUGIN_PREFIX,
  Symbols,
  Tsu,
  clearObject,
  none,
  stringRightSplit
} from '@kotori-bot/core';
import { BUILD_FILE, DEV_CODE_DIRS, DEV_FILE, DEV_IMPORT } from './consts';
import { localeTypeSchema } from './global';

declare module '@kotori-bot/core' {
  interface Context {
    readonly [Symbols.module]?: Set<[ModuleInstance, ModuleConfig]>;
    moduleAll(): void; // Symbols
    watchFile(): void;
  }

  interface EventsList {
    'internal:loader_all_modules': { type: 'internal:loader_all_modules' };
  }
}

const modulePackageSchema = Tsu.Object({
  name: Tsu.String().regexp(/kotori-plugin-[a-z]([a-z,0-9]{3,13})\b/),
  version: Tsu.String(),
  description: Tsu.String(),
  main: Tsu.String(),
  license: Tsu.Literal('GPL-3.0'),
  author: Tsu.Union([Tsu.String(), Tsu.Array(Tsu.String())]),
  peerDependencies: Tsu.Object({
    'kotori-bot': Tsu.String()
  }),
  kotori: Tsu.Object({
    enforce: Tsu.Union([Tsu.Literal('pre'), Tsu.Literal('post')]).optional(),
    meta: Tsu.Object({
      language: Tsu.Array(localeTypeSchema).default([])
    }).default({ language: [] })
  }).default({
    enforce: undefined,
    meta: { language: [] }
  })
});

function moduleLoadOrder(pkg: ModulePackage) {
  if (pkg.name.includes(DATABASE_PREFIX)) return 1;
  if (pkg.name.includes(ADAPTER_PREFIX)) return 2;
  if (CORE_MODULES.includes(pkg.name)) return 3;
  if (pkg.kotori.enforce === 'pre') return 4;
  if (!pkg.kotori.enforce) return 5;
  return 5;
}

export class Loader extends Core {
  private isDev = this.options.env === 'dev';

  readonly [Symbols.module]: Set<[ModuleInstance, ModuleConfig]> = new Set();

  getDirFiles(rootDir: string) {
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
    const moduleRootDir: string[] = [];
    Object.assign(this.config.global.dirs, [this.baseDir.modules]).forEach((dir) => {
      if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) moduleRootDir.push(dir);
    });
    return moduleRootDir;
  }

  private getModuleList(rootDir: string) {
    const files = fs.readdirSync(rootDir);

    files.forEach(async (fileName) => {
      const dir = path.join(rootDir, fileName);
      if (!fs.statSync(dir).isDirectory()) return;
      if (rootDir !== this.baseDir.modules && fileName.startsWith(PLUGIN_PREFIX)) return;
      const packagePath = path.join(dir, 'package.json');
      let pkg: ModulePackage;
      if (!fs.existsSync(packagePath)) return;
      try {
        pkg = JSON.parse(fs.readFileSync(packagePath).toString());
      } catch {
        throw new DevError(`illegal package.json ${packagePath}`);
      }
      const result = modulePackageSchema.parseSafe(pkg);
      if (!result.value) {
        if (rootDir !== this.baseDir.modules) return;
        throw new DevError(`package.json format error ${packagePath}: ${result.error.message}`);
      }
      pkg = result.data;
      const main = path.resolve(dir, this.isDev && existsSync(path.resolve(dir, DEV_IMPORT)) ? DEV_IMPORT : pkg.main);
      if (!fs.existsSync(main)) throw new DevError(`cannot find ${main}`);
      const dirs = path.join(dir, this.isDev ? DEV_CODE_DIRS : path.dirname(pkg.main));
      const files = fs.statSync(dirs).isDirectory() ? this.getDirFiles(dirs) : [];
      this[Symbols.module].add([
        { pkg, main, files },
        this.config.plugin[stringRightSplit(pkg.name, PLUGIN_PREFIX)] || {}
      ]);
    });
  }

  private moduleQuick(instance: ModuleInstance, config: ModuleConfig) {
    this.load(instance, config);
  }

  useAll() {
    this.getModuleRootDir().forEach((dir) => this.getModuleList(dir));
    const modules: [ModuleInstance, ModuleConfig][] = [];
    this[Symbols.module].forEach((val) => modules.push(val));
    modules
      .sort((el1, el2) => moduleLoadOrder(el1[0].pkg) - moduleLoadOrder(el2[0].pkg))
      .forEach((el) => this.moduleQuick(...el));
  }

  async watchFile() {
    this[Symbols.module].forEach((val) =>
      moduleData.fileList.forEach((file) =>
        fs.watchFile(file, () => (this.dispose(moduleData) as unknown) && this.moduleQuick(moduleData))
      )
    );
    none(this);
  }
}

export default Loader;
