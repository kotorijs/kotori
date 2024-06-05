/*
 * @Author: hotaru biyuehuya@gmail.com
 * @Blog: https://hotaru.icu
 * @Date: 2023-06-24 15:12:55
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2024-06-05 11:06:52
 */
import {
  KotoriError,
  Container,
  Tsu,
  type AdapterConfig,
  type CoreConfig,
  Symbols,
  DEFAULT_CORE_CONFIG,
  loadConfig,
  TsuError,
  Core,
  Context,
  ModuleError,
  DEFAULT_PORT,
  formatFactory
} from '@kotori-bot/core';
import path from 'node:path';
import fs from 'node:fs';
import Logger, { LoggerLevel } from '@kotori-bot/logger';
import Runner, { localeTypeSchema } from './runner';
import loadInfo from '../utils/log';
import {
  BUILD_CONFIG_NAME,
  BUILD_MODE,
  CONFIG_EXT,
  DEV_CONFIG_NAME,
  DEV_MODE,
  SUPPORTS_HALF_VERSION,
  SUPPORTS_VERSION
} from '../constants';
import Server from '../service/server';
import type Database from '../service/database';
import File from '../service/file';

declare module '@kotori-bot/core' {
  interface Context {
    readonly baseDir: Runner['baseDir'];
    readonly options: Runner['options'];
    readonly [Symbols.modules]: Runner[typeof Symbols.modules];
    loadAll(): void;
    watcher(): void;
    logger: Logger;
    /* Service */
    server: Server;
    db: Database;
    file: File;
    /* Tool */
    format: ReturnType<typeof formatFactory>;
    locale: Context['i18n']['locale'];
  }

  interface GlobalConfig {
    dirs: string[];
    port: number;
  }
}

const enum GLOBAL {
  REPO = 'https://github.com/kotorijs/kotori',
  UPDATE = 'https://hotaru.icu/api/agent/?url=https://raw.githubusercontent.com/kotorijs/kotori/master/packages/core/package.json'
}

function getBaseDir(filename: string, dir?: string) {
  let root = dir ? path.resolve(dir) : path.resolve(__dirname, '..').replace('loader', 'kotori');
  let filenameFull: string | undefined;
  let count = 0;
  let index = 0;

  while (!filenameFull) {
    if (count > 5) {
      Logger.fatal(`cannot find file ${filename} `);
      process.exit();
    }

    const fullName = `${filename}${CONFIG_EXT[index]}`;
    if (fs.existsSync(path.join(root, fullName))) {
      filenameFull = fullName;
      break;
    }
    if (index === CONFIG_EXT.length - 1) {
      root = path.join(root, '..');
      index = 0;
      count += 1;
    } else {
      index += 1;
    }
  }

  const baseDir = {
    root,
    modules: path.join(root, 'modules'),
    data: path.join(root, 'data'),
    logs: path.join(root, 'logs'),
    config: filenameFull
  };
  Object.entries(baseDir)
    .filter(([key]) => !['modules', 'config'].includes(key))
    .forEach(([, val]) => {
      if (!fs.existsSync(val)) fs.mkdirSync(val);
    });
  return baseDir;
}

/* eslint consistent-return: 0 */
function getCoreConfig(baseDir: Runner['baseDir']) {
  try {
    const result1 = Tsu.Object({
      global: Tsu.Object({
        dirs: Tsu.Array(Tsu.String()).default([]),
        port: Tsu.Number().default(DEFAULT_PORT),
        lang: localeTypeSchema.default(DEFAULT_CORE_CONFIG.global.lang),
        'command-prefix': Tsu.String().default(DEFAULT_CORE_CONFIG.global['command-prefix'])
      }),
      plugin: Tsu.Object({})
        .index(
          Tsu.Object({
            filter: Tsu.Object({}).default({})
          }).default({ filter: {} })
        )
        .default(DEFAULT_CORE_CONFIG.plugin)
    })
      .default({ global: Object.assign(DEFAULT_CORE_CONFIG.global), plugin: DEFAULT_CORE_CONFIG.plugin })
      .parse(loadConfig(path.join(baseDir.root, baseDir.config), baseDir.config.split('.').pop() as 'json'));

    return Tsu.Object({
      adapter: Tsu.Object({})
        .index(
          Tsu.Object({
            extends: Tsu.String(),
            master: Tsu.Union([Tsu.Number(), Tsu.String()]),
            lang: localeTypeSchema.default(result1.global.lang),
            'command-prefix': Tsu.String().default(result1.global['command-prefix'])
          })
        )
        .default(DEFAULT_CORE_CONFIG.adapter)
    }).parse(result1) as CoreConfig;
  } catch (err) {
    if (!(err instanceof TsuError)) throw err;
    Logger.fatal(`file ${baseDir.config} format error: ${err.message}`);
    process.exit();
  }
}

export class Loader extends Container {
  private readonly ctx: Context;

  private loadCount: number = 0;

  public constructor(options?: { dir?: string; mode?: string; level?: number }) {
    super();
    const filename = options && options.mode?.startsWith(DEV_MODE) ? DEV_CONFIG_NAME : BUILD_CONFIG_NAME;
    const runnerConfig = {
      baseDir: getBaseDir(filename, options?.dir),
      options: { mode: (options?.mode || BUILD_MODE) as typeof BUILD_MODE },
      level: options?.level || options?.mode?.startsWith(DEV_MODE) ? LoggerLevel.DEBUG : LoggerLevel.INFO
    };
    const ctx = new Core(getCoreConfig(runnerConfig.baseDir));

    ctx.provide('runner', new Runner(ctx, runnerConfig));
    ctx.mixin('runner', ['baseDir', 'options']);
    Container.setInstance(ctx);
    ctx.provide('loader-tools', { format: formatFactory(ctx.i18n), locale: ctx.i18n.locale.bind(ctx.i18n) });

    ctx.mixin('loader-tools', ['locale', 'format']);
    ctx.i18n.use(path.resolve(__dirname, '../../locales'));

    this.ctx = Container.getInstance();
    this.ctx.logger.trace(`options:`, options);
    this.ctx.logger.trace(`runnerConfig:`, runnerConfig);
    this.ctx.logger.trace(`baseDir:`, this.ctx.baseDir);
    this.ctx.logger.trace(`options:`, this.ctx.options);
    this.ctx.logger.trace(`config:`, this.ctx.config);
    this.ctx.logger.trace(`where:`, __dirname, __filename);
    this.ctx.logger.trace(`running:`, process.cwd());
  }

  public run() {
    loadInfo(this.ctx.pkg, this.ctx);
    this.catchError();
    this.listenMessage();
    this.setPreService();
    this.loadAllModules();
    this.checkUpdate();
  }

  private handleError(err: Error | unknown, prefix: string) {
    if (!(err instanceof KotoriError)) {
      if (err instanceof Error) {
        this.ctx.logger.label(prefix).error(err.message, err.stack);
      } else {
        this.ctx.logger.label(prefix).error(err);
      }
      return;
    }

    const list = {
      ServiceError: () => this.ctx.logger.label('service').warn,
      ModuleError: () => this.ctx.logger.label('module').error,
      UnknownError: () => this.ctx.logger.error,
      DevError: () => this.ctx.logger.label('error').debug
    };
    list[err.name]().bind(this.ctx.logger)(err.message, err.stack);
  }

  private catchError() {
    process.on('uncaughtExceptionMonitor', (err) => this.handleError(err, 'sync'));
    process.on('unhandledRejection', (err) => this.handleError(err, 'async'));
    process.on('SIGINT', () => process.exit());
    this.ctx.logger.debug(this.ctx.locale('loader.debug.info'));
  }

  private listenMessage() {
    this.ctx.on('connect', (data) => {
      const { type, mode, normal, address: addr, adapter } = data;
      let msg: string;
      if (type === 'connect') {
        switch (mode) {
          case 'ws':
            msg = this.ctx.format(`loader.bots.${normal ? 'connect' : 'reconnect'}`, [addr]);
            break;
          case 'ws-reverse':
            msg = this.ctx.format(`loader.bots.${normal ? 'start' : 'restart'}`, [addr]);
            break;
          default:
            msg = this.ctx.format('loader.bots.ready', [addr]);
        }
      } else {
        switch (mode) {
          case 'ws':
            msg = this.ctx.format(`loader.bots.disconnect${normal ? '' : '.error'}`, [addr]);
            break;
          case 'ws-reverse':
            msg = this.ctx.format(`loader.bots.stop${normal ? '' : '.error'}`, [addr]);
            break;
          default:
            msg = this.ctx.format('loader.bots.dispose', [addr]);
        }
      }
      adapter.ctx.logger[normal ? 'info' : 'warn'](msg);
    });
    this.ctx.on('status', ({ status, adapter }) => adapter.ctx.logger.info(status));
    this.ctx.on('ready_module', (data) => {
      if (typeof data.instance !== 'object') return;

      const pkg = data.instance.name
        ? this.ctx.get<Runner>('runner')[Symbols.modules].get(data.instance.name)
        : undefined;
      if (!pkg) return;

      this.loadCount += 1;
      const { name, version, author, peerDependencies } = pkg[0].pkg;
      this.ctx.logger.info(
        this.ctx.format('loader.modules.load', [name, version, Array.isArray(author) ? author.join(',') : author])
      );

      const requiredVersion = peerDependencies['kotori-bot'];
      if (
        requiredVersion.includes('workspace') ||
        SUPPORTS_VERSION.exec(requiredVersion) ||
        requiredVersion.includes(this.ctx.pkg.version)
      )
        return;
      if (SUPPORTS_HALF_VERSION.exec(requiredVersion)) {
        this.ctx.logger.warn(this.ctx.format('loader.modules.incomplete', [requiredVersion]));
      } else {
        this.ctx.logger.error(this.ctx.format('loader.modules.unsupported', [requiredVersion]));
      }
    });
  }

  private setPreService() {
    this.ctx.service('server', new Server(this.ctx.extends(), { port: this.ctx.config.global.port }));
    this.ctx.service('file', new File(this.ctx.extends()));
  }

  private loadAllModules() {
    this.ctx.get<Runner>('runner').loadAll();
    const failLoadCount = this.ctx.get<Runner>('runner')[Symbols.modules].size - this.loadCount;
    this.ctx.logger.info(
      this.ctx.format(`loader.modules.all${failLoadCount > 0 ? '.failed' : ''}`, [this.loadCount, failLoadCount])
    );
    this.loadAllAdapter();
    this.ctx.emit('ready');
  }

  private loadAllAdapter() {
    const adapters = this.ctx[Symbols.adapter];
    Object.keys(this.ctx.config.adapter).forEach((botName) => {
      const botConfig = this.ctx.config.adapter[botName];
      const array = adapters.get(botConfig.extends);

      if (!array)
        return this.ctx.logger.warn(this.ctx.format('loader.adapters.notfound', [botConfig.extends, botName]));

      const result = array[1]?.parseSafe(botConfig);
      if (result && !result.value)
        throw new ModuleError(this.ctx.format('error.module.config_bot', [botName, result.error.message]));

      const bot = new array[0](
        this.ctx.extends({}, `${botConfig.extends}/${botName}`),
        result ? (result.data as AdapterConfig) : botConfig,
        botName
      );

      this.ctx.on('ready', () => bot.start());
      this.ctx.on('dispose', () => bot.stop());
    });
  }

  private async checkUpdate() {
    const { version } = this.ctx.pkg;
    const res = await this.ctx.http
      .get(GLOBAL.UPDATE)
      .catch(() => this.ctx.logger.error(this.ctx.locale('loader.tips.update.failed')));
    if (!res || !Tsu.Object({ version: Tsu.String() }).check(res)) {
      this.ctx.logger.warn(this.ctx.locale('loader.tips.update.failed'));
    } else if (version === res.version) {
      this.ctx.logger.info(this.ctx.locale('loader.tips.update.latest'));
    } else {
      this.ctx.logger.warn(this.ctx.format('loader.tips.update.available', [version, res.version, GLOBAL.REPO]));
    }
  }
}

export default Loader;
