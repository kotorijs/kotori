import { Events, Http, obj } from '@kotori-bot/tools';
import Logger from '@kotori-bot/logger';
import I18n from '@kotori-bot/i18n';
import type { Parser } from 'tsukiko';
import { Context, Symbols } from '../context';
import Config from './config';
import Message from './message';
import Modules from './modules';
import type { AdapterClass, EventsMapping } from '../types';
import type { Api } from '../service';

declare module '../context' {
  interface Context extends Events<EventsMapping> {
    /* Core */
    readonly [Symbols.adapter]: Core[typeof Symbols.adapter];
    readonly [Symbols.bot]: Core[typeof Symbols.bot];
    /* Config */
    readonly config: Config['config'];
    readonly pkg: Config['pkg'];
    /* Modules */
    use(modules: Parameters<Modules['use']>[0], config?: Parameters<Modules['use']>[1]): Promise<void>;
    dispose(modules: Parameters<Modules['dispose']>[0]): void;
    /* Message */
    readonly [Symbols.midware]: Message[typeof Symbols.midware];
    readonly [Symbols.command]: Message[typeof Symbols.command];
    readonly [Symbols.regexp]: Message[typeof Symbols.regexp];
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
  readonly [Symbols.adapter]: Map<string, [AdapterClass, Parser<unknown>?]> = new Map();

  readonly [Symbols.bot]: Map<string, Set<Api>> = new Map();

  constructor(config?: ConstructorParameters<typeof Config>[0]) {
    super();
    this.provide('config', new Config(config));
    this.mixin('config', ['config', 'pkg']);
    this.provide('events', new Events<EventsMapping>());
    this.mixin('events', ['emit', 'on', 'once', 'off', 'offAll']);
    this.provide('modules', new Modules(this));
    this.mixin('modules', ['use', 'dispose']);
    this.provide('message', new Message(this));
    this.mixin('message', ['midware', 'command', 'regexp']);
    this.provide('http', new Http({ validateStatus: () => true }));
    this.inject('http');
    this.provide('i18n', new I18n({ lang: this.config.global.lang }));
    this.inject('i18n');
    this.inject('i18n');
    const logger = Object.assign(
      Logger,
      new Proxy(Logger.debug, {
        apply: (target, _, argArray) => {
          if ((globalThis as obj).env_mode === 'dev') target(argArray);
        }
      })
    );
    this.provide('logger', logger);
    this.inject('logger');
  }
}

export default Core;
