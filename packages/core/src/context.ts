import Logger from '@kotori-bot/logger';
import { Http } from '@kotori-bot/tools';
import Locale from './utils/i18n';
import Internal from './base/internal';
import { KotoriConfig } from './types';

export class Context extends Internal {
  http = new Http({ validateStatus: () => true });

  logger = Object.assign(
    Logger,
    new Proxy(Logger.debug, {
      apply: (target, _, argArray) => {
        if (this.options.env === 'dev') target(argArray);
      }
    })
  );

  readonly i18n: Locale;

  private initialize() {
    this.registeMessageEvent();
    this.midware((next, session) => {
      const { selfId } = session.api.adapter;
      if (session.userId !== selfId) next();
    }, 50);
    // this.on('ready_all', () => this.startAllService());
  }

  constructor(Config?: KotoriConfig) {
    super(Config);
    this.i18n = new Locale(this.config.global.lang);
    this.initialize();
  }
}

export default Context;
