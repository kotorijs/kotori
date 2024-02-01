import { Events, Http } from '@kotori-bot/tools';
import Logger from '@kotori-bot/logger';
import I18n from '@kotori-bot/i18n';
import type { Parser } from 'tsukiko';
import { Context, Symbols } from '../context/index';
import Config from './config';
import Message from './message';
import Modules from './modules';
import { AdapterClass, CoreConfig, EventsList } from '../types/index';
import { Api } from '../components';

declare module '../context/index' {
  interface Context extends Events<EventsList> {}
  interface Context {
    readonly [Symbols.adapter]: Map<string, [AdapterClass, Parser<unknown>?]>;
    readonly [Symbols.bot]: Map<string, Set<Api>>;
    http: Http;
    i18n: I18n;
    logger: typeof Logger;
  }
}

export class Core extends Context {
  readonly [Symbols.adapter] = new Map();

  readonly [Symbols.bot] = new Map();

  constructor(config?: CoreConfig) {
    super();
    this.provide('config', new Config(config));
    this.mixin('config', ['pkg', 'baseDir', 'config', 'options']);
    this.provide('events', new Events<EventsList>());
    this.mixin('events', ['emit', 'on', 'once', 'off', 'offAll']);
    this.provide('modules', new Modules(this));
    this.mixin('modules', ['load', 'dispose']);
    this.provide('message', new Message(this));
    this.mixin('message', ['midware', 'command', 'regexp']);
    this.inject('http', new Http({ validateStatus: () => true }));
    this.inject('i18n', new I18n({ lang: this.config.global.lang }));
    const logger = Object.assign(
      Logger,
      new Proxy(Logger.debug, {
        apply: (target, _, argArray) => {
          if (this.options.env === 'dev') target(argArray);
        }
      })
    );
    this.inject('logger', logger);
  }
}

export default Core;
