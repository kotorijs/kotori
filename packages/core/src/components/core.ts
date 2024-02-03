import { Events, Http } from '@kotori-bot/tools';
import Logger from '@kotori-bot/logger';
import I18n from '@kotori-bot/i18n';
import type { Parser } from 'tsukiko';
import { Context, Symbols } from '../context';
import Config from './config';
import Message from './message';
import Modules from './modules';
import type { AdapterClass, EventsList } from '../types';
import type { Api } from '../service';

declare module '../context' {
  interface Context extends Events<EventsList> {}
  interface Context {
    /* Core */
    readonly [Symbols.adapter]: Map<string, [AdapterClass, Parser<unknown>?]>;
    readonly [Symbols.bot]: Map<string, Set<Api>>;
    /* Config */
    readonly pkg: Config['pkg'];
    readonly baseDir: Config['baseDir'];
    readonly config: Config['config'];
    readonly options: Config['options'];
    /* Modules */
    load(modules: Parameters<Modules['load']>[0], config?: Parameters<Modules['load']>[1]): void;
    dispose(modules: Parameters<Modules['dispose']>[0]): void;
    /* Message */
    midware(callback: Parameters<Message['midware']>[0], priority?: Parameters<Message['midware']>[1]): () => void;
    command(
      template: Parameters<Message['command']>[0],
      config?: Parameters<Message['command']>[1]
    ): ReturnType<Message['command']>;
    regexp(match: Parameters<Message['regexp']>[0], callback: Parameters<Message['regexp']>[1]): () => void;
    /* Inject */
    http: Http;
    i18n: I18n;
    logger: typeof Logger;
  }
}

export class Core extends Context {
  readonly [Symbols.adapter] = new Map();

  readonly [Symbols.bot] = new Map();

  constructor(config?: ConstructorParameters<typeof Config>[0]) {
    super();
    this.provide('config', new Config(config));
    this.mixin('config', ['pkg', 'baseDir', 'config', 'options']);
    this.provide('events', new Events<EventsList>());
    this.mixin('events', ['emit', 'on', 'once', 'off', 'offAll', 'before']);
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
