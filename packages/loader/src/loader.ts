/*
 * @Author: hotaru biyuehuya@gmail.com
 * @Blog: https://hotaru.icu
 * @Date: 2023-06-24 15:12:55
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2024-02-01 21:15:23
 */
import {
  KotoriError,
  type EventsList,
  Container,
  Tsu,
  AdapterConfig,
  CoreConfig,
  Adapter,
  Parser,
  AdapterClass,
  Symbols
} from '@kotori-bot/core';
import Modules from './modules';
import { getBaseDir, getCoreConfig, isDev } from './global';
import loadInfo from './log';

const enum GLOBAL {
  REPO = 'https://github.com/kotorijs/kotori'
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

class Main extends Container {
  private ctx: Modules;

  private loadCount: number = 0;

  private failLoadCount: number = 0;

  constructor() {
    super();
    Container.setInstance(new Modules(kotoriConfig()));
    this.ctx = Container.getInstance() as Modules;
    // 静态类型继续居然她妈是隔离的
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

    this.ctx.on('connect', handleConnectInfo);
    this.ctx.on('disconnect', handleConnectInfo);
    this.ctx.on('ready', (data) => {
      if (!data.module) return;
      this.loadCount += 1;
      if (data.state) {
        const { name, version, author } = data.module.package;
        this.ctx.logger.info(
          `Loaded ${name} Version: ${version} ${
            Array.isArray(author) ? `Authors: ${author.join(',')}` : `Author: ${author}`
          }`
        );
      } else {
        this.failLoadCount += 1;
      }
      if (this.loadCount !== this.ctx[Symbols.module].size) return;
      this.ctx.logger.info(
        `Loaded ${this.loadCount} modules (plugins)${this.failLoadCount > 0 ? `, failed to load ${this.failLoadCount} modules` : ''}`
      );
      this.startAllService();
    });
    /*     this.ctx.on('ready_all', (data) => {
      const failed = data.expected - data.reality;

      this.startAllService();
    }); */
  }

  private loadAllModule() {
    this.ctx.moduleAll();
    if (isDev()) this.ctx.watchFile();
  }

  private startAllService() {
    // const services = this.ctx[Symbols.adapter];
    /* 看一下这里 */
    /* start adapters */
    // const adapters = Object.keys(services).filter((key) => Modules.isAdapterClass(services[key][0]));
    const adapters = this.ctx[Symbols.adapter];
    Object.keys(this.ctx.config.adapter).forEach((botName) => {
      const botConfig = this.ctx.config.adapter[botName];
      if (!adapters.has(botConfig.extends)) {
        this.ctx.logger.warn(`Cannot find adapter '${botConfig.extends}' for ${botName}`);
        return;
      }
      const array: [AdapterClass, Parser<unknown>?] = adapters.get(botConfig.extends);
      const isSchema = array[1]?.parseSafe(botConfig);
      if (isSchema && !isSchema.value) return;
      const bot = new array[0](this.ctx, isSchema ? (isSchema.data as AdapterConfig) : botConfig, botName);
      // if (!(botConfig.extend in Adapter)) Adapter.apis[botConfig.extend] = []; // I dont know whats this
      // this.ctx.botStack[botConfig.extend].push(bot.api);
      bot.start();
    });
    /* here need more supports... */
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

export default Main;
