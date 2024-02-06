import fs, { existsSync } from 'fs';
import path from 'path';
import {
  ADAPTER_PREFIX,
  Context,
  DATABASE_PREFIX,
  DevError,
  ModuleConfig,
  ModuleInstance,
  ModulePackage,
  PLUGIN_PREFIX,
  Symbols,
  Tsu,
  stringRightSplit
} from '@kotori-bot/core';
import { DEFAULT_SUPPORTS, LocaleType } from '@kotori-bot/i18n';
import Logger, { ConsoleTransport, LoggerLevel } from '@kotori-bot/logger';
import { BUILD_FILE, DEV_CODE_DIRS, DEV_FILE, DEV_IMPORT } from './consts';

interface BaseDir {
  root: string;
  modules: string;
  logs: string;
}

interface Options {
  mode: 'dev' | 'build';
}

interface RunnerConfig {
  baseDir: BaseDir;
  options: Options;
}

export const localeTypeSchema = Tsu.Custom<LocaleType>(
  (val) => typeof val === 'string' && DEFAULT_SUPPORTS.includes(val as LocaleType)
);

const modulePackageSchema = Tsu.Object({
  name: Tsu.String().regexp(/kotori-plugin-[a-z]([a-z,0-9]{3,13})\b/),
  version: Tsu.String(),
  description: Tsu.String(),
  main: Tsu.String(),
  license: Tsu.Literal('GPL-3.0'),
  keywords: Tsu.Custom<string[]>(
    (val) => Array.isArray(val) && val.includes('kotori') && val.includes('chatbot') && val.includes('kotori-plugin')
  ),
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
  // if (CORE_MODULES.includes(pkg.name)) return 3;
  if (pkg.kotori.enforce === 'pre') return 4;
  if (!pkg.kotori.enforce) return 5;
  return 6;
}

export class Runner {
  readonly baseDir: BaseDir;

  readonly options: Options;

  private ctx: Context;

  private isDev: Boolean;

  readonly [Symbols.modules]: Set<[ModuleInstance, ModuleConfig]> = new Set();

  constructor(ctx: Context, config: RunnerConfig) {
    this.ctx = ctx;
    /* handle config */
    this.baseDir = config.baseDir;
    this.options = config.options;
    this.isDev = this.options.mode === 'dev';
    if (this.isDev) this.watcher();
    const loggerOptions = {
      level: this.isDev ? LoggerLevel.TRACE : LoggerLevel.INFO,
      label: [],
      transports: new ConsoleTransport()
    };
    const logger: Logger & { ctx: Context } = Object.assign(new Logger(), { ctx: this.ctx });
    ctx.provide(
      'logger',
      logger.extends(
        new Proxy(loggerOptions, {
          get: (target, prop, receiver) => {
            if (prop === 'label') {
              return logger.ctx.identity ? [logger.ctx.identity, ...target.label] : target.label;
            }
            return Reflect.get(target, prop, receiver);
          }
        })
      )
    );
    ctx.inject('logger');
  }

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
    const moduleRootDir: string[] = [];
    [
      ...this.ctx.config.global.dirs.map((dir) => path.resolve(this.ctx.baseDir.root, dir)),
      this.ctx.baseDir.modules
    ].forEach((dir) => {
      if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) moduleRootDir.push(dir);
    });
    return moduleRootDir;
  }

  private getModuleList(rootDir: string) {
    fs.readdirSync(rootDir).forEach(async (fileName) => {
      const dir = path.join(rootDir, fileName);
      if (!fs.statSync(dir).isDirectory()) return;
      if (rootDir !== this.ctx.baseDir.modules && !fileName.startsWith(PLUGIN_PREFIX)) return;
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
        if (rootDir !== this.ctx.baseDir.modules) return;
        throw new DevError(`package.json format error ${packagePath}: ${result.error.message}`);
      }
      pkg = result.data;
      const devMode = this.isDev && existsSync(path.resolve(dir, DEV_IMPORT));
      const main = path.resolve(dir, devMode ? DEV_IMPORT : pkg.main);
      if (!fs.existsSync(main)) throw new DevError(`cannot find ${main}`);
      const dirs = path.join(dir, devMode ? DEV_CODE_DIRS : path.dirname(pkg.main));
      const files = fs.statSync(dirs).isDirectory() ? this.getDirFiles(dirs) : [];
      this[Symbols.modules].add([
        { pkg, main, files },
        this.ctx.config.plugin[stringRightSplit(pkg.name, PLUGIN_PREFIX)] || {}
      ]);
    });
  }

  private moduleQuick(instance: ModuleInstance, config: ModuleConfig) {
    this.ctx.use(instance, config);
  }

  useAll() {
    this.getModuleRootDir().forEach((dir) => this.getModuleList(dir));
    const modules: [ModuleInstance, ModuleConfig][] = [];
    this[Symbols.modules].forEach((val) => modules.push(val));
    modules
      .sort((el1, el2) => moduleLoadOrder(el1[0].pkg) - moduleLoadOrder(el2[0].pkg))
      .forEach((el) => this.moduleQuick(...el));
  }

  watcher() {
    this[Symbols.modules].forEach((data) =>
      data[0].files.forEach((file) =>
        fs.watchFile(file, async () => {
          this.ctx.logger.debug(`file happen changed, module ${data[0].pkg.name} is reloading...`);
          this.ctx.dispose(data[0]);
          this.moduleQuick(...data);
        })
      )
    );
  }
}

export default Runner;
