/*
 * @Author: hotaru biyuehuya@gmail.com
 * @Blog: https://hotaru.icu
 * @Date: 2023-06-24 15:12:55
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2024-02-24 19:11:35
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
  DEFAULT_PORT
} from '@kotori-bot/core';
import path from 'path';
import fs from 'fs';
import Logger from '@kotori-bot/logger';
import Runner, { localeTypeSchema } from './runner';
import loadInfo from './log';
import { BUILD_CONFIG_NAME, DEV_CONFIG_NAME, SUPPORTS_HALF_VERSION, SUPPORTS_VERSION } from './consts';
import Server from './service/server';
import type Database from './service/database';
import File from './service/file';

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
  }

  interface GlobalConfig {
    dirs: string[];
    port: number;
  }
}

const enum GLOBAL {
  REPO = 'https://github.com/kotorijs/kotori',
  UPDATE = 'https://hotaru.icu/api/agent/?url=https://raw.githubusercontent.com/kotorijs/kotori/master/packages/kotori/package.json'
}

function getRunnerConfig(file: string, dir?: string) {
  const handle = (root: string) => {
    const baseDir = {
      root,
      modules: path.join(root, 'modules'),
      data: path.join(root, 'data'),
      logs: path.join(root, 'logs')
    };
    Object.values(baseDir).forEach((val) => {
      if (!fs.existsSync(val)) fs.mkdirSync(val);
    });
    return baseDir;
  };
  const options = {
    mode: file === DEV_CONFIG_NAME ? 'dev' : 'build'
  } as const;
  if (dir) return { baseDir: handle(path.resolve(dir)), options };
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
  return { baseDir: handle(root), options };
}

/* eslint consistent-return: 0 */
function getCoreConfig(file: string, baseDir: Runner['baseDir']) {
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
        .default(DEFAULT_CORE_CONFIG.adapter)
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

  public constructor(options?: { dir?: string; mode?: string }) {
    super();
    const file = options && options.mode === 'dev' ? DEV_CONFIG_NAME : BUILD_CONFIG_NAME;
    const runnerConfig = getRunnerConfig(file, options?.dir);
    const ctx = new Core(getCoreConfig(file, runnerConfig.baseDir));
    ctx.provide('runner', new Runner(ctx, runnerConfig));
    ctx.mixin('runner', ['baseDir', 'options']);
    Container.setInstance(ctx);
    this.ctx = Container.getInstance();
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
      adapter.ctx.logger[normal ? 'info' : 'warn'](msg);
    });
    this.ctx.on('status', (data) => {
      const { status, adapter } = data;
      adapter.ctx.logger.info(status);
    });
    this.ctx.on('ready_module', (data) => {
      if (typeof data.instance !== 'object') return;
      const pkg = data.instance.name
        ? this.ctx.get<Runner>('runner')[Symbols.modules].get(data.instance.name)
        : undefined;
      if (!pkg) return;
      this.loadCount += 1;
      const { name, version, author, peerDependencies } = pkg[0].pkg;
      this.ctx.logger.info(
        `loaded module ${name} version: ${version} ${
          Array.isArray(author) ? `authors: ${author.join(',')}` : `author: ${author}`
        }`
      );
      const requiredVersion = peerDependencies['kotori-bot'];
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
      `loaded ${this.loadCount} modules successfully${failLoadCount > 0 ? `, failed to load ${failLoadCount} modules` : ''} `
    );
    this.loadAllAdapter();
    this.ctx.emit('ready');
  }

  private loadAllAdapter() {
    const adapters = this.ctx[Symbols.adapter];
    Object.keys(this.ctx.config.adapter).forEach((botName) => {
      const botConfig = this.ctx.config.adapter[botName];
      const array = adapters.get(botConfig.extends);
      if (!array) {
        this.ctx.logger.warn(`cannot find adapter '${botConfig.extends}' for ${botName}`);
        return;
      }
      const result = array[1]?.parseSafe(botConfig);
      if (result && !result.value)
        throw new ModuleError(`Config format of adapter ${botName} is error: ${result.error.message}`);
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
