/*
 * @Author: hotaru biyuehuya@gmail.com
 * @Blog: https://hotaru.icu
 * @Date: 2023-06-24 15:12:55
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2024-02-04 21:17:05
 */
import {
  KotoriError,
  type EventsList,
  Container,
  Tsu,
  type AdapterConfig,
  type CoreConfig,
  Adapter,
  Symbols,
  DEFAULT_CORE_CONFIG,
  loadConfig,
  TsuError,
  obj,
  Core,
  Context
} from '@kotori-bot/core';
import { DEFAULT_LANG } from '@kotori-bot/i18n';
import path, { join } from 'path';
import { existsSync } from 'fs';
import Modules, { localeTypeSchema } from './modules';
import loadInfo from './log';
import { SUPPORTS_HALF_VERSION, SUPPORTS_VERSION } from '.';

declare module '@kotori-bot/core' {
  interface Context {
    readonly [Symbols.modules]?: Modules[typeof Symbols.modules];
    useAll(): void; // Symbols
    watcher(): void;
  }

  interface EventsList {
    'internal:loader_all_modules': { type: 'internal:loader_all_modules' };
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
  const { env_dir: envDir } = globalThis as obj;
  if (envDir) return { root: envDir, modules: path.join(envDir, 'modules') };
  let root = path.resolve(__dirname, '..').replace('loader', 'kotori');
  let count = 0;
  while (!existsSync(path.join(root, CONFIG_FILE()))) {
    if (count > 5) {
      /* eslint no-console: 0 */
      console.error(`cannot find kotori-bot global ${CONFIG_FILE()}`);
      process.exit();
    }
    root = path.join(root, '..');
    count += 1;
  }
  return { root, modules: path.join(root, 'modules') };
}

/* eslint consistent-return: 0 */
function getCoreConfig(baseDir: CoreConfig['baseDir']) {
  try {
    const result1 = Tsu.Object({
      global: Tsu.Object({
        dirs: Tsu.Array(Tsu.String()).default([]),
        lang: localeTypeSchema.default(DEFAULT_LANG),
        'command-prefix': Tsu.String().default(DEFAULT_CORE_CONFIG.config.global['command-prefix'])
      }),
      plugin: Tsu.Object({})
        .index(
          Tsu.Object({
            filter: Tsu.Object({}).default({})
          }).default({ filter: {} })
        )
        .default({})
    })
      .default({ global: DEFAULT_CORE_CONFIG.config.global, plugin: DEFAULT_CORE_CONFIG.config.plugin })
      .parse(loadConfig(join(baseDir.root, CONFIG_FILE()), 'yaml'));
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
    }).parse(result1) as CoreConfig['config'];
  } catch (err) {
    if (!(err instanceof TsuError)) throw err;
    console.error(`kotori-bot global ${CONFIG_FILE} format error: ${err.message}`);
    process.exit();
  }
}

const kotoriConfig = (): CoreConfig => {
  let result = {} as CoreConfig;
  const baseDir = getBaseDir();
  result = {
    baseDir,
    config: getCoreConfig(baseDir),
    options: {
      env: isDev() ? 'dev' : 'build'
    }
  };
  return result;
};

export class Loader extends Container {
  private ctx: Context;

  private loadCount: number = 0;

  private failLoadCount: number = 0;

  constructor() {
    super();
    const ctx = new Core(kotoriConfig());
    ctx.provide('modulesall', new Modules(ctx));
    ctx.mixin('modulesall', ['useAll']);
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
    const isKotoriError = err instanceof KotoriError;
    if (!isKotoriError) {
      this.ctx.logger.tag(prefix, 'default', prefix === 'UCE' ? 'cyanBG' : 'greenBG').error(err);
      return;
    }
    this.ctx.logger
      .tag(err.name.split('Error')[0].toUpperCase(), 'yellow', 'default')
      [err.level === 'normal' ? 'error' : err.level](err.message, err.stack);
    if (err.name !== 'CoreError') return;
    this.ctx.logger.tag('CORE', 'black', 'red').error(err.message);
    process.emit('SIGINT');
  }

  private catchError() {
    process.on('uncaughtExceptionMonitor', (err) => this.handleError(err, 'UCE'));
    process.on('unhandledRejection', (err) => this.handleError(err, 'UHR'));
    process.on('SIGINT', () => {
      process.exit();
    });
    this.ctx.logger.debug('Run info: develop with debuing...');
  }

  private listenMessage() {
    const handleConnectInfo = (data: EventsList['connect'] | EventsList['disconnect']) => {
      if (!data.info) return;
      if (data.service instanceof Adapter) {
        this.ctx.logger[data.normal ? 'log' : 'warn'](
          `[${data.service.platform}]`,
          `${data.service.identity}:`,
          data.info
        );
      }
    };
    this.ctx.on('error', (data) => {
      throw data.error;
    });

    this.ctx.on('connect', handleConnectInfo);
    this.ctx.on('disconnect', handleConnectInfo);
    this.ctx.on('ready', (data) => {
      if (!data.module || typeof data.module === 'string') return;
      this.loadCount += 1;
      if (data.state) {
        const { name, version, author } = data.module.pkg;
        this.ctx.logger.info(
          `Loaded ${name} Version: ${version} ${
            Array.isArray(author) ? `Authors: ${author.join(',')}` : `Author: ${author}`
          }`
        );
        const requiredVersion = data.module.pkg.peerDependencies['kotori-bot'];
        if (
          !requiredVersion.includes('workspace') &&
          (!SUPPORTS_VERSION.exec(requiredVersion) || requiredVersion !== this.ctx.pkg.version)
        ) {
          this.ctx.logger.warn(
            SUPPORTS_HALF_VERSION.exec(requiredVersion)
              ? `Incomplete supported module version: ${requiredVersion}`
              : `Unsupported module version: ${requiredVersion}`
          );
        }
      } else {
        this.failLoadCount += 1;
      }
      if (this.loadCount !== this.ctx.get('modulesall')![Symbols.modules].size) return;
      this.ctx.logger.info(
        `Loaded ${this.loadCount - this.failLoadCount} modules ${this.failLoadCount > 0 ? `, failed to load ${this.failLoadCount} modules` : ''}`
      );
      this.loadAllService();
      this.ctx.emit('ready', {});
    });
  }

  private loadAllModule() {
    this.ctx.useAll();
    // if (isDev()) this.ctx.watcher();
  }

  private loadAllService() {
    /* load database before adapters */
    const adapters = this.ctx[Symbols.adapter];
    Object.keys(this.ctx.config.adapter).forEach((botName) => {
      const botConfig = this.ctx.config.adapter[botName];
      const array = adapters.get(botConfig.extends);
      if (!array) {
        this.ctx.logger.warn(`Cannot find adapter '${botConfig.extends}' for ${botName}`);
        return;
      }
      const isSchema = array[1]?.parseSafe(botConfig);
      if (isSchema && !isSchema.value) return;
      /* adapter donot support hot reload, so no extends for context */
      const bot = new array[0](this.ctx, isSchema ? (isSchema.data as AdapterConfig) : botConfig, botName);
      this.ctx.on('ready', (data) => {
        if (data.module) return;
        bot.start();
      });
    });
    /* load custom services after adapters */
  }

  private async checkUpdate() {
    const { version } = this.ctx.pkg;
    const res = await this.ctx.http
      .get(
        'https://hotaru.icu/api/agent/?url=https://raw.githubusercontent.com/kotorijs/kotori/master/packages/kotori/package.json'
      )
      .catch(() => this.ctx.logger.error('Get update failed, please check your network'));
    if (!res || !Tsu.Object({ version: Tsu.String() }).check(res)) {
      this.ctx.logger.error(`Detection update failed`);
    } else if (version === res.version) {
      this.ctx.logger.log('Kotori is currently the latest version');
    } else {
      this.ctx.logger.warn(
        `The current version of Kotori is ${version}, and the latest version is ${res.version}. Please go to ${GLOBAL.REPO} to update`
      );
    }
  }
}

export default Modules;
