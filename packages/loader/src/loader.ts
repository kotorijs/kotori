/*
 * @Author: hotaru biyuehuya@gmail.com
 * @Blog: https://hotaru.icu
 * @Date: 2023-06-24 15:12:55
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2024-02-06 20:01:10
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
  obj,
  Core,
  Context
} from '@kotori-bot/core';
import { DEFAULT_LANG } from '@kotori-bot/i18n';
import path from 'path';
import fs from 'fs';
import Logger from '@kotori-bot/logger';
import Runner, { localeTypeSchema } from './runner';
import loadInfo from './log';
import { BUILD_CONFIG_NAME, DEV_CONFIG_NAME, SUPPORTS_HALF_VERSION, SUPPORTS_VERSION } from './consts';

declare module '@kotori-bot/core' {
  interface Context {
    readonly baseDir: Runner['baseDir'];
    readonly options: Runner['options'];
    readonly [Symbols.modules]: Runner[typeof Symbols.modules];
    useAll(): void; // Symbols
    watcher(): void;
    logger: Logger;
  }

  interface GlobalConfig {
    dirs: string[];
  }
}

const enum GLOBAL {
  REPO = 'https://github.com/kotorijs/kotori'
}

function getRunnerConfig(file: string, dir?: string) {
  const handle = (baseDir: Runner['baseDir']) => {
    if (!fs.existsSync(baseDir.modules)) fs.mkdirSync(baseDir.modules);
    if (!fs.existsSync(baseDir.logs)) fs.mkdirSync(baseDir.logs);
    return baseDir;
  };
  const options = {
    mode: file === DEV_CONFIG_NAME ? 'dev' : 'build'
  } as const;
  if (dir)
    return {
      baseDir: handle({ root: dir, modules: path.join(dir, 'modules'), logs: path.join(dir, 'logs') }),
      options
    };
  let root = path.resolve(__dirname, '..').replace('loader', 'kotori');
  let count = 0;
  while (!fs.existsSync(path.join(root, file))) {
    if (count > 5) {
      Logger.fatal(`cannot find file ${file} `);
      process.exit();
    }
    root = path.join(root, '..');
    count += 1;
  }
  return {
    baseDir: handle({ root, modules: path.join(root, 'modules'), logs: path.join(root, 'logs') }),
    options
  };
}

/* eslint consistent-return: 0 */
function getCoreConfig(file: string, baseDir: Runner['baseDir']) {
  try {
    const result1 = Tsu.Object({
      global: Tsu.Object({
        dirs: Tsu.Array(Tsu.String()).default([]),
        lang: localeTypeSchema.default(DEFAULT_LANG),
        'command-prefix': Tsu.String().default(DEFAULT_CORE_CONFIG.global['command-prefix'])
      }),
      plugin: Tsu.Object({})
        .index(
          Tsu.Object({
            filter: Tsu.Object({}).default({})
          }).default({ filter: {} })
        )
        .default({})
    })
      .default({ global: Object.assign(DEFAULT_CORE_CONFIG.global), plugin: DEFAULT_CORE_CONFIG.plugin })
      .parse(loadConfig(path.join(baseDir.root, file), 'yaml'));
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
        .default({})
    }).parse(result1) as CoreConfig;
  } catch (err) {
    if (!(err instanceof TsuError)) throw err;
    Logger.fatal(`file ${file} format error: ${err.message}`);
    process.exit();
  }
}

export class Loader extends Container {
  private ctx: Context;

  private loadCount: number = 0;

  private failLoadCount: number = 0;

  constructor(options?: { dir?: string; mode?: string }) {
    super();
    const file = options && options.mode ? DEV_CONFIG_NAME : BUILD_CONFIG_NAME;
    const runnerConfig = getRunnerConfig(file, options?.dir);
    const ctx = new Core(getCoreConfig(file, runnerConfig.baseDir));
    ctx.provide('runner', new Runner(ctx, runnerConfig));
    ctx.mixin('runner', ['baseDir', 'options', 'useAll', 'watcher']);
    Container.setInstance(ctx);
    this.ctx = Container.getInstance();
  }

  run() {
    loadInfo(this.ctx.pkg, this.ctx);
    this.catchError();
    this.listenMessage();
    this.loadAllModule();
    this.checkUpdate();
  }

  private handleError(err: Error | unknown, prefix: string) {
    if (!(err instanceof KotoriError)) {
      this.ctx.logger.label(prefix).error(err);
      return;
    }
    ({
      DatabaseError: () => this.ctx.logger.label('database').warn(err.message, err.stack),
      ModuleError: () => this.ctx.logger.label('module').error(err.message, err.stack),
      UnknownError: () => this.ctx.logger.error(err.name, err.stack),
      DevError: () => this.ctx.logger.label('error').debug(err.name, err.stack)
    })[err.name]();
  }

  private catchError() {
    process.on('uncaughtExceptionMonitor', (err) => this.handleError(err, 'sync'));
    process.on('unhandledRejection', (err) => this.handleError(err, 'async'));
    process.on('SIGINT', () => process.exit());
    this.ctx.logger.debug('run info: develop with debuing...');
  }

  private listenMessage() {
    this.ctx.on('connect', (data) => {
      const { type, mode, normal, address, adapter } = data;
      let msg: string;
      if (type === 'connect') {
        switch (mode) {
          case 'ws':
            msg = `${normal ? 'Connect' : 'Reconnect'} server to ${address}`;
            break;
          case 'ws-reverse':
            msg = `server ${normal ? 'start' : 'restart'} at ${address}`;
            break;
          default:
            msg = `ready completed about ${address}`;
        }
      } else {
        switch (mode) {
          case 'ws':
            msg = `disconnect server from ${address}${normal ? '' : ' unexpectedly'}`;
            break;
          case 'ws-reverse':
            msg = `server stop at ${address}${normal ? '' : ' unexpectedly'}`;
            break;
          default:
            msg = `dispose completed about ${address}`;
        }
      }
      this.ctx.logger.label([adapter.platform, adapter.identity])[normal ? 'info' : 'warn'](msg);
    });
    this.ctx.on('status', (data) => {
      const { status, adapter } = data;
      this.ctx.logger.label([adapter.platform, adapter.identity]).info(status);
    });
    this.ctx.on('ready_module', (data) => {
      if (!data.module || typeof data.module === 'string') return;
      this.loadCount += 1;
      const { name, version, author } = data.module.pkg;
      if (data.error) {
        this.failLoadCount += 1;
        this.ctx.logger.warn(`failed to load module ${name}`);
        if (data.error instanceof KotoriError) {
          process.emit('uncaughtExceptionMonitor', data.error);
        } else {
          this.ctx.logger.warn(data.error);
        }
      } else {
        this.ctx.logger.info(
          `loaded module ${name} version: ${version} ${
            Array.isArray(author) ? `authors: ${author.join(',')}` : `author: ${author}`
          }`
        );
      }
      const requiredVersion = data.module.pkg.peerDependencies['kotori-bot'];
      if (
        !requiredVersion.includes('workspace') &&
        (!SUPPORTS_VERSION.exec(requiredVersion) || requiredVersion !== this.ctx.pkg.version)
      ) {
        if (SUPPORTS_HALF_VERSION.exec(requiredVersion)) {
          this.ctx.logger.warn(`incomplete supported module version: ${requiredVersion}`);
        } else {
          this.ctx.logger.error(`unsupported module version: ${requiredVersion}`);
        }
      }
      if (this.loadCount !== this.ctx.get('runner')![Symbols.modules].size) return;
      this.ctx.logger.info(
        `loaded ${this.loadCount - this.failLoadCount} modules successfully${this.failLoadCount > 0 ? `, failed to load ${this.failLoadCount} modules` : ''} `
      );
      this.loadAllService();
      this.ctx.emit('ready');
    });
  }

  private loadAllModule() {
    this.ctx.useAll();
  }

  private loadAllService() {
    /* load database before adapters */
    const adapters = this.ctx[Symbols.adapter];
    Object.keys(this.ctx.config.adapter).forEach((botName) => {
      const botConfig = this.ctx.config.adapter[botName];
      const array = adapters.get(botConfig.extends);
      if (!array) {
        this.ctx.logger.warn(`cannot find adapter '${botConfig.extends}' for ${botName}`);
        return;
      }
      const isSchema = array[1]?.parseSafe(botConfig);
      if (isSchema && !isSchema.value) return;
      /* adapter donot support hot reload, so no extends for context */
      const bot = new array[0](this.ctx, isSchema ? (isSchema.data as AdapterConfig) : botConfig, botName);
      this.ctx.on('ready', () => bot.start());
    });
    /* load custom services after adapters */
  }

  private async checkUpdate() {
    const { version } = this.ctx.pkg;
    const res = await this.ctx.http
      .get(
        'https://hotaru.icu/api/agent/?url=https://raw.githubusercontent.com/kotorijs/kotori/master/packages/kotori/package.json'
      )
      .catch(() => this.ctx.logger.error('get update failed, please check your network'));
    if (!res || !Tsu.Object({ version: Tsu.String() }).check(res)) {
      this.ctx.logger.warn(`detection update failed`);
    } else if (version === res.version) {
      this.ctx.logger.info('kotori is currently the latest version');
    } else {
      this.ctx.logger.warn(
        `the current version of Kotori is ${version}, and the latest version is ${res.version}. please go to ${GLOBAL.REPO} to update`
      );
    }
  }
}

export default Loader;
