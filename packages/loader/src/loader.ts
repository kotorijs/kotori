/*
 * @Author: hotaru biyuehuya@gmail.com
 * @Blog: https://hotaru.icu
 * @Date: 2023-06-24 15:12:55
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2024-02-05 18:45:51
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
import Runner, { localeTypeSchema } from './runner';
import loadInfo from './log';
import { SUPPORTS_HALF_VERSION, SUPPORTS_VERSION } from './consts';

declare module '@kotori-bot/core' {
  interface Context {
    readonly baseDir: Runner['baseDir'];
    readonly options: Runner['options'];
    readonly [Symbols.modules]: Runner[typeof Symbols.modules];
    useAll(): void; // Symbols
    watcher(): void;
  }

  interface GlobalConfig {
    dirs: string[];
  }
}

const enum GLOBAL {
  REPO = 'https://github.com/kotorijs/kotori'
}

function isDev() {
  return (globalThis as obj).env_mode === 'dev';
}

const CONFIG_FILE = () => (isDev() ? 'kotori.dev.yml' : 'kotori.yml');

function getBaseDir() {
  const handle = (baseDir: Runner['baseDir']) => {
    if (!fs.existsSync(baseDir.modules)) fs.mkdirSync(baseDir.modules);
    if (!fs.existsSync(baseDir.logs)) fs.mkdirSync(baseDir.logs);
    return baseDir;
  };
  const { env_dir: envDir } = globalThis as obj;
  if (envDir) return handle({ root: envDir, modules: path.join(envDir, 'modules'), logs: path.join(envDir, 'logs') });
  let root = path.resolve(__dirname, '..').replace('loader', 'kotori');
  let count = 0;
  while (!fs.existsSync(path.join(root, CONFIG_FILE()))) {
    if (count > 5) {
      console.error(`cannot find kotori-bot global ${CONFIG_FILE()}`);
      process.exit();
    }
    root = path.join(root, '..');
    count += 1;
  }
  return handle({ root, modules: path.join(root, 'modules'), logs: path.join(root, 'logs') });
}

/* eslint consistent-return: 0 */
function getCoreConfig(baseDir: Runner['baseDir']) {
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
      .parse(loadConfig(path.join(baseDir.root, CONFIG_FILE()), 'yaml'));
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
    console.error(`kotori-bot global ${CONFIG_FILE} format error: ${err.message}`);
    process.exit();
  }
}

export class Loader extends Container {
  private ctx: Context;

  private loadCount: number = 0;

  private failLoadCount: number = 0;

  constructor() {
    super();
    const baseDir = getBaseDir();
    const options = { env: isDev() ? 'dev' : 'build' } as const;
    const ctx = new Core(getCoreConfig(baseDir));
    ctx.provide('modulesall', new Runner(ctx, { baseDir, options }));
    ctx.mixin('modulesall', ['baseDir', 'options', 'useAll', 'watcher']);
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
      this.ctx.logger.tag(prefix, 'default', prefix === 'UCE' ? 'cyanBG' : 'greenBG').error(err);
      return;
    }
    this.ctx.logger
      .tag(err.name.split('Error')[0].toUpperCase(), 'yellow', 'default')
      [err.level === 'normal' ? 'error' : err.level](err.message, err.stack);
  }

  private catchError() {
    process.on('uncaughtExceptionMonitor', (err) => this.handleError(err, 'UCE'));
    process.on('unhandledRejection', (err) => this.handleError(err, 'UHR'));
    process.on('SIGINT', () => {
      process.exit();
    });
    this.ctx.logger.debug('run info: develop with debuing...');
  }

  private listenMessage() {
    this.ctx.on('error', (data) => {
      throw data.error;
    });
    this.ctx.on('connect', (data) => {
      const { type, mode, normal, address, adapter } = data;
      let info: string;
      if (type === 'connect') {
        switch (mode) {
          case 'ws':
            info = `${normal ? 'Connect' : 'Reconnect'} server to ${address}`;
            break;
          case 'ws-reverse':
            info = `server ${normal ? 'start' : 'restart'} at ${address}`;
            break;
          default:
            info = `ready completed about ${address}`;
        }
      } else {
        switch (mode) {
          case 'ws':
            info = `disconnect server from ${address}${normal ? '' : ' unexpectedly'}`;
            break;
          case 'ws-reverse':
            info = `server stop at ${address}${normal ? '' : ' unexpectedly'}`;
            break;
          default:
            info = `dispose completed about ${address}`;
        }
      }
      this.ctx.logger[normal ? 'log' : 'warn'](`[${adapter.platform}]`, `${adapter.identity}:`, info);
    });
    this.ctx.on('status', (data) => {
      const { status, adapter } = data;
      this.ctx.logger.log(`[${adapter.platform}]`, `${adapter.identity}:`, status);
    });
    this.ctx.on('ready_module', (data) => {
      if (!data.module || typeof data.module === 'string') return;
      this.loadCount += 1;
      if (data.state) {
        const { name, version, author } = data.module.pkg;
        this.ctx.logger.info(
          `loaded ${name} version: ${version} ${
            Array.isArray(author) ? `authors: ${author.join(',')}` : `author: ${author}`
          }`
        );
      } else {
        this.failLoadCount += 1;
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
      if (this.loadCount !== this.ctx.get('modulesall')![Symbols.modules].size) return;
      this.ctx.logger.info(
        `loaded ${this.loadCount - this.failLoadCount} modules ${this.failLoadCount > 0 ? `, failed to load ${this.failLoadCount} modules` : ''}`
      );
      this.loadAllService();
      this.ctx.emit('ready');
    });
  }

  private loadAllModule() {
    this.ctx.useAll();
    if (isDev()) this.ctx.watcher();
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
      this.ctx.logger.error(`detection update failed`);
    } else if (version === res.version) {
      this.ctx.logger.log('kotori is currently the latest version');
    } else {
      this.ctx.logger.warn(
        `the current version of Kotori is ${version}, and the latest version is ${res.version}. please go to ${GLOBAL.REPO} to update`
      );
    }
  }
}

export default Loader;
