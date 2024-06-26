import fs, { existsSync } from 'node:fs';
import path, { resolve } from 'node:path';
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
import {
  BUILD_FILE,
  BUILD_MODE,
  CORE_MODULES,
  // CORE_MODULES,
  DEV_CODE_DIRS,
  DEV_FILE,
  DEV_IMPORT,
  DEV_MODE
} from '../constants';
import '../types/internal';
import KotoriLogger from '../utils/logger';
import './loader';

interface BaseDir {
  root: string;
  modules: string;
  data: string;
  logs: string;
  config: string;
}

interface Options {
  mode: typeof BUILD_MODE | typeof DEV_MODE;
}

interface RunnerConfig {
  baseDir: BaseDir;
  options: Options;
  level: number;
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
  if (CORE_MODULES.includes(pkg.name)) return 1;
  if (pkg.name.includes(DATABASE_PREFIX)) return 2;
  if (pkg.name.includes(ADAPTER_PREFIX)) return 3;
  if (pkg.kotori.enforce === 'pre') return 4;
  if (!pkg.kotori.enforce) return 5;
  return 6;
}

export class Runner {
  public readonly baseDir: BaseDir;

  public readonly options: Options;

  private readonly ctx: Context;

  private readonly isDev: boolean;

  public readonly [Symbols.modules]: Map<string, [ModuleMeta, ModuleConfig]> = new Map();

  public constructor(ctx: Context, config: RunnerConfig) {
    this.ctx = ctx;
    /* handle config */
    this.baseDir = config.baseDir;
    this.options = config.options;
    this.isDev = this.options.mode === DEV_MODE;

    const loggerOptions = {
      level: this.ctx.config.global.level ?? config.level,
      label: [],
      transports: [
        new ConsoleTransport({
          template: '<blue>%time%</blue> %level% (<bold>%pid%</bold>) %labels%: %msg%',
          time: 'M/D H:m:s'
        }),
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

  private async checkModuleFiles(rootDir: string, filename: string) {
    const dir = path.join(rootDir, filename);
    if (!fs.statSync(dir).isDirectory()) return;
    if (rootDir !== this.ctx.baseDir.modules && !filename.startsWith(PLUGIN_PREFIX)) return;

    const packagePath = path.join(dir, 'package.json');
    let pkg: ModulePackage;

    if (!fs.existsSync(packagePath)) return;
    try {
      pkg = JSON.parse(fs.readFileSync(packagePath).toString());
    } catch {
      throw new DevError(this.ctx.format('error.dev.package.illegal', [packagePath]));
    }

    const result = modulePackageSchema.parseSafe(pkg);
    if (!result.value) {
      if (rootDir !== this.ctx.baseDir.modules) return;
      throw new DevError(this.ctx.format('error.dev.package.missing', [packagePath, result.error.message]));
    }

    pkg = result.data;
    const devMode = this.isDev && existsSync(path.resolve(dir, DEV_IMPORT));
    const main = path.resolve(dir, devMode ? DEV_IMPORT : pkg.main);
    if (!fs.existsSync(main)) throw new DevError(this.ctx.format('error.dev.main_file', [main]));
    const dirs = path.join(dir, devMode ? DEV_CODE_DIRS : path.dirname(pkg.main));
    const files = fs.statSync(dirs).isDirectory() ? this.getDirFiles(dirs) : [];

    this[Symbols.modules].set(pkg.name, [
      { pkg, files, main },
      this.ctx.config.plugin[stringRightSplit(pkg.name, PLUGIN_PREFIX)] || {}
    ]);
  }

  private getModuleList(rootDir: string) {
    this.ctx.logger.trace('load dirs:', rootDir);
    fs.readdirSync(rootDir).forEach(async (filename) => {
      await this.checkModuleFiles(rootDir, filename);
    });
  }

  private loadLang(lang?: string | string[]) {
    if (lang) this.ctx.i18n.use(resolve(...(Array.isArray(lang) ? lang : [lang])));
  }

  private loadEx(instance: ModuleMeta, origin: ModuleConfig) {
    this.ctx.logger.trace('module:', instance, origin);

    // adapted @kotori-bot/kotori-plugin-filter
    if (!instance.main) return;

    const parsed = (schema: Parser<unknown>) => {
      const result = (schema as Parser<ModuleConfig>).parseSafe(config);
      if (!result.value)
        throw new ModuleError(this.ctx.format('error.module.config', [pkg.name, result.error.message]));
      return result.data;
    };

    const { main, pkg } = instance;
    /* eslint-disable-next-line import/no-dynamic-require, global-require, @typescript-eslint/no-var-requires */
    let obj = require(main);
    let config = origin;
    const adapterName = pkg.name.split(ADAPTER_PREFIX)[1];

    // exclude plugins was registered by decorators
    if (this.ctx.get<{ registers: string[] } | undefined>('decorators')?.registers.includes(pkg.name)) {
      this.ctx.emit('ready_module_decorators', pkg.name);
      return;
    }

    if (
      Adapter.isPrototypeOf.call(Adapter, obj.default) &&
      adapterName &&
      (!obj.config || obj.config instanceof Parser)
    ) {
      /* Adapter Class */
      this.ctx[Symbols.adapter].set(adapterName, [obj.default, obj.config]);
      obj = {};
    } else if (Service.isPrototypeOf.call(Service, obj.default)) {
      /* Service Class */
      obj = {};
    } else if (obj.config instanceof Parser) {
      config = parsed(obj.config);
    }

    if (obj.lang) this.loadLang(obj.lang);
    if (obj.default) {
      if (obj.default.lang) this.loadLang(obj.default.lang);
      if (obj.default.config instanceof Parser) config = parsed(obj.default.config);
    } else if (obj.Main) {
      if (obj.Main.lang) this.loadLang(obj.Main.lang);
      if (obj.Main.config instanceof Parser) config = parsed(obj.Main.config);
    }

    this.ctx.load({ name: pkg.name, ...obj, config });
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
      .sort(([{ pkg: pkg1 }], [{ pkg: pkg2 }]) => moduleLoadOrder(pkg1) - moduleLoadOrder(pkg2))
      .forEach((el) => this.loadEx(...el));
    if (this.isDev) this.watcher();
  }

  public watcher() {
    this[Symbols.modules].forEach((data) =>
      data[0].files.forEach((file) =>
        fs.watchFile(file, async () => {
          this.ctx.logger.debug(this.ctx.format('loader.debug.reload', [data[0].pkg.name]));
          this.unloadEx(data[0]);
          this.loadEx(...data);
        })
      )
    );
  }
}

export default Runner;
