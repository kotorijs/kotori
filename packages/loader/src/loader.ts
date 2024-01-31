/*
 * @Author: hotaru biyuehuya@gmail.com
 * @Blog: https://hotaru.icu
 * @Date: 2023-06-24 15:12:55
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2024-01-01 17:10:00
 */
import {
  KotoriError,
  type EventsList,
  ContextInstance,
  Tsu,
  AdapterConfig,
  KotoriConfig,
  Adapter,
  Parser,
  AdapterClass
} from '@kotori-bot/core';
import Modules from './modules';
import { getBaseDir, getGlobalConfig, isDev } from './global';
import loadInfo from './log';

const enum GLOBAL {
  REPO = 'https://github.com/kotorijs/kotori'
}

const kotoriConfig = (): KotoriConfig => {
  let result = {} as KotoriConfig;
  const baseDir = getBaseDir();
  result = {
    baseDir,
    config: getGlobalConfig(baseDir),
    options: {
      env: isDev() ? 'dev' : 'build'
    }
  };
  return result;
};

class Main extends ContextInstance {
  private ctx: Modules;

  constructor() {
    super();
    ContextInstance.setInstance(new Modules(kotoriConfig()));
    this.ctx = ContextInstance.getInstance() as Modules;
    // 静态类型继续居然她妈是隔离的
  }

  run() {
    loadInfo(this.ctx.package, this.ctx);
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
      if (!data.module || !data.result) return;
      const { name, version, author } = data.module.package;
      this.ctx.logger.info(
        `Loaded ${name} Version: ${version} ${
          Array.isArray(author) ? `Authors: ${author.join(',')}` : `Author: ${author}`
        }`
      );
    });
    this.ctx.on('ready_all', (data) => {
      const failed = data.expected - data.reality;
      this.ctx.logger.info(
        `Loaded ${data.reality} modules (plugins)${failed > 0 ? `, failed to load ${failed} modules` : ''}`
      );
      this.startAllService();
    });
  }

  private loadAllModule() {
    this.ctx.moduleAll();
    if (isDev()) this.ctx.watchFile();
  }

  private startAllService() {
    const services = this.ctx.internal.getServices();
    /* start adapters */
    const adapters = Object.keys(services).filter((key) => Modules.isAdapterClass(services[key][0]));
    Object.keys(this.ctx.config.adapter).forEach((botName) => {
      const botConfig = this.ctx.config.adapter[botName];
      if (!adapters.includes(botConfig.extends)) {
        this.ctx.logger.warn(`Cannot find adapter '${botConfig.extends}' for ${botName}`);
        return;
      }
      const array = services[botConfig.extends] as unknown as [AdapterClass, Parser<unknown>?];
      const isSchema = array[1]?.parseSafe(botConfig);
      if (isSchema && !isSchema.value) {
        return;
      }
      const bot = new array[0](this.ctx, isSchema ? (isSchema.data as AdapterConfig) : botConfig, botName);
      // if (!(botConfig.extend in Adapter)) Adapter.apis[botConfig.extend] = []; // I dont know whats this
      // this.ctx.botStack[botConfig.extend].push(bot.api);
      bot.start();
    });
    /* here need more supports... */
  }

  private async checkUpdate() {
    const { version } = this.ctx.package;
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
