import fs, { existsSync } from 'fs';
import path from 'path';
import {
  ADAPTER_PREFIX,
  Adapter,
  Context,
  DATABASE_PREFIX,
  DevError,
  LocaleType,
  ModuleConfig,
  ModuleError,
  PLUGIN_PREFIX,
  Parser,
  Service,
  Symbols,
  Tsu,
  stringRightSplit
} from '@kotori-bot/core';
import { ConsoleTransport, FileTransport, LoggerLevel } from '@kotori-bot/logger';
import { BUILD_FILE, DEV_CODE_DIRS, DEV_FILE, DEV_IMPORT } from './consts';
import KotoriLogger from './utils/logger';

interface BaseDir {
  root: string;
  modules: string;
  data: string;
  logs: string;
}

interface Options {
  mode: 'dev' | 'build';
}

interface RunnerConfig {
  baseDir: BaseDir;
  options: Options;
}

interface ModulePackage {
  name: string;
  version: string;
  description: string;
  main: string;
  keywords: string[];
  license: 'GPL-3.0';
  author: string | string[];
  peerDependencies: {
    'kotori-bot': string;
    [propName: string]: string;
  };
  kotori: {
    enforce?: 'pre' | 'post';
    meta: {
      language: LocaleType[];
    };
  };
}

interface ModuleMeta {
  pkg: ModulePackage;
  files: string[];
  main: string;
}

export const localeTypeSchema = Tsu.Union([
  Tsu.Union([Tsu.Literal('en_US'), Tsu.Literal('ja_JP')]),
  Tsu.Union([Tsu.Literal('zh_TW'), Tsu.Any()])
]);

const modulePackageSchema = Tsu.Object({
  name: Tsu.String().regexp(/kotori-plugin-[a-z]([a-z,0-9]{2,13})\b/),
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
  public readonly baseDir: BaseDir;

  public readonly options: Options;

  private ctx: Context;

  private isDev: boolean;

  public readonly [Symbols.modules]: Map<string, [ModuleMeta, ModuleConfig]> = new Map();

  public constructor(ctx: Context, config: RunnerConfig) {
    this.ctx = ctx;
    /* handle config */
    this.baseDir = config.baseDir;
    this.options = config.options;
    this.isDev = this.options.mode === 'dev';
    const loggerOptions = {
      level: this.isDev ? LoggerLevel.TRACE : LoggerLevel.INFO,
      label: [],
      transports: [
        new ConsoleTransport(),
        new FileTransport({ dir: this.baseDir.logs, filter: (data) => data.level >= LoggerLevel.WARN })
      ]
    };
    ctx.provide('logger', new KotoriLogger(loggerOptions, this.ctx));
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
      this[Symbols.modules].set(pkg.name, [
        { pkg, files, main },
        this.ctx.config.plugin[stringRightSplit(pkg.name, PLUGIN_PREFIX)] || {}
      ]);
    });
  }

  private loadEx(instance: ModuleMeta, config: ModuleConfig) {
    const { main, pkg } = instance;
    /* eslint-disable-next-line import/no-dynamic-require, global-require, @typescript-eslint/no-var-requires */
    let obj = require(main);
    let handle = config;
    const adapterName = pkg.name.split(ADAPTER_PREFIX)[1];
    if (
      Adapter.isPrototypeOf.call(Adapter, obj.default) &&
      adapterName &&
      (!obj.config || obj.config instanceof Parser)
    ) {
      this.ctx[Symbols.adapter].set(adapterName, [obj.default, obj.config]);
      obj = {};
    } else if (Service.isPrototypeOf.call(Service, obj.default)) {
      obj = {};
    } else if (obj.config instanceof Parser) {
      const result = (obj.config as Parser<ModuleConfig>).parseSafe(handle);
      if (!result.value) throw new ModuleError(`Config format of module ${pkg.name} is error: ${result.error.message}`);
      handle = result.data;
    }
    if (obj.lang) this.ctx.i18n.use(Array.isArray(obj.lang) ? path.resolve(...obj.lang) : path.resolve(obj.lang));
    this.ctx.load({ name: pkg.name, ...obj, config: handle });
  }

  private unloadEx(instance: ModuleMeta) {
    instance.files.forEach((file) => delete require.cache[require.resolve(file)]);
    this.ctx.load({ name: instance.pkg.name });
  }

  public loadAll() {
    this.getModuleRootDir().forEach((dir) => this.getModuleList(dir));
    const modules: [ModuleMeta, ModuleConfig][] = [];
    this[Symbols.modules].forEach((val) => modules.push(val));
    modules
      .sort((el1, el2) => moduleLoadOrder(el1[0].pkg) - moduleLoadOrder(el2[0].pkg))
      .forEach((el) => this.loadEx(...el));
    if (this.isDev) this.watcher();
  }

  public watcher() {
    this[Symbols.modules].forEach((data) =>
      data[0].files.forEach((file) =>
        fs.watchFile(file, async () => {
          this.ctx.logger.debug(`file happen changed, module ${data[0].pkg.name} is reloading...`);
          this.unloadEx(data[0]);
          this.loadEx(...data);
        })
      )
    );
  }
}

export default Runner;
