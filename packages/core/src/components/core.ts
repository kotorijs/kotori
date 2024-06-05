import { Http } from '@kotori-bot/tools';
import I18n from '@kotori-bot/i18n';
import type { Parser } from 'tsukiko';
import { Context } from 'fluoro';
import Config from './config';
import Message from './message';
import type { AdapterClass } from '../types';
import { Cache, type Api } from '../service';
import { Symbols } from '../global';

declare module 'fluoro' {
  interface Context {
    /* Core */
    readonly [Symbols.adapter]: Core[typeof Symbols.adapter];
    readonly [Symbols.bot]: Core[typeof Symbols.bot];
    /* Config */
    readonly config: Config['config'];
    readonly pkg: Config['pkg'];
    /* Message */
    readonly [Symbols.midware]: Message[typeof Symbols.midware];
    readonly [Symbols.command]: Message[typeof Symbols.command];
    readonly [Symbols.regexp]: Message[typeof Symbols.regexp];
    midware: Message['midware'];
    command: Message['command'];
    regexp: Message['regexp'];
    notify: Message['notify'];
    task: Message['task'];
    /* Inject */
    http: Http;
    i18n: I18n;
    /* Service */
    cache: Cache;
  }
}

export class Core extends Context {
  public readonly [Symbols.adapter]: Map<string, [AdapterClass, Parser<unknown>?]> = new Map();

  public readonly [Symbols.bot]: Map<string, Set<Api>> = new Map();

  public constructor(config?: ConstructorParameters<typeof Config>[0]) {
    super();
    this.provide('config', new Config(config));
    this.mixin('config', ['config', 'pkg']);
    this.provide('message', new Message(this));
    this.mixin('message', ['midware', 'command', 'regexp', 'notify', 'task']);
    this.provide('http', new Http({ validateStatus: () => true }));
    this.inject('http');
    this.provide('i18n', new I18n({ lang: this.config.global.lang }));
    this.inject('i18n');
    this.service('cache', new Cache(this.extends()));
  }
}

export default Core;
