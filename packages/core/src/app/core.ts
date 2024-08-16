import { Http } from '@kotori-bot/tools'
import I18n from '@kotori-bot/i18n'
import type { Parser } from 'tsukiko'
import FluoroContext from 'fluoro'
import type { Service as FluoroService, EventsList as FluoroEventsList } from 'fluoro'
import Config from './config'
import Message from './message'
import type { AdapterClass } from '../types'
import { Cache, type Api } from '../components'
import { Symbols } from '../global'
import type { EventsMapping } from '../types/events'

export * from 'fluoro'

export type EventsList = FluoroEventsList<EventsMapping>

export interface Context {
  /* Core */
  /**
   * Adapter constructors list.
   *
   * @readonly
   */
  readonly [Symbols.adapter]: Context[typeof Symbols.adapter]
  /**
   * Bot instances list.
   *
   * @readonly
   */
  readonly [Symbols.bot]: Context[typeof Symbols.bot]
  /* Config */
  /**
   * Core config.
   *
   * @readonly
   */
  readonly config: Config['config']
  /**
   * Meta information.
   *
   * @readonly
   */
  readonly meta: Config['meta']
  /* Message */
  /**
   * Registered middlewares list.
   *
   * @readonly
   */
  readonly [Symbols.midware]: Message[typeof Symbols.midware]
  /**
   * Registered commands list.
   *
   * @readonly
   */
  readonly [Symbols.command]: Message[typeof Symbols.command]
  /**
   * Registered regexps list.
   *
   * @readonly
   */
  readonly [Symbols.regexp]: Message[typeof Symbols.regexp]
  /**
   * Registered scheduled tasks list.
   *
   * @readonly
   */
  readonly [Symbols.task]: Message[typeof Symbols.task]
  /**
   * Registered session filters list.
   *
   * @readonly
   */
  readonly [Symbols.filter]: Message[typeof Symbols.filter]
  /**
   * Session promises in progress list.
   *
   * @readonly
   */
  readonly [Symbols.promise]: Message[typeof Symbols.promise]
  /**
   * Register a message handled middleware.
   *
   * @param callback - Middleware callback
   * @param priority - Middleware priority, default is 100
   * @returns dispose function
   */
  midware: Message['midware']
  /**
   * Register a command.
   *
   * @param template - Command template
   * @param config - Command config, optional
   * @returns Command instance
   */
  command: Message['command']
  /**
   * Register a regexp.
   *
   * @param match - Regexp to match
   * @param callback - Regexp callback
   * @returns dispose function
   */
  regexp: Message['regexp']
  /**
   * Register a scheduled task.
   *
   * @param options - Task options
   * @param callback - Task callback
   * @returns dispose function
   */
  task: Message['task']
  /**
   * Register a session filter.
   *
   * @param option - Filter option
   * @returns new context
   */
  filter: Message['filter']
  /**
   * Send a notified message to the master of first bot instance at config.
   *
   * @experimental
   */
  notify: Message['notify']
  /**
   * Send a message to all sessions on all bots.
   *
   * @experimental
   */
  boardcast: Message['boardcast']
  /* Inject */
  /** Http request methods */
  http: Http
  /** International methods */
  i18n: I18n
  /* Service */
  /** Cache service */
  cache: Cache
}

// biome-ignore lint:
export class Context extends FluoroContext<EventsMapping> implements Context {
  public readonly [Symbols.adapter]: Map<string, [AdapterClass, Parser<unknown>?]> = new Map()

  public readonly [Symbols.bot]: Map<string, Set<Api>> = new Map()

  public constructor(config?: ConstructorParameters<typeof Config>[0]) {
    super()
    this.provide('config', new Config(config))
    this.mixin('config', ['config', 'meta'])
    this.provide('message', new Message(this))
    this.mixin('message', [
      'midware',
      'command',
      'regexp',
      'notify',
      'boardcast',
      'task',
      'filter',
      Symbols.command,
      Symbols.midware,
      Symbols.task,
      Symbols.filter,
      Symbols.promise,
      Symbols.regexp
    ])
    this.provide('http', new Http())
    this.inject('http')
    this.provide('i18n', new I18n({ lang: this.config.global.lang }))
    this.inject('i18n')
    this.service('cache', new Cache(this.extends('cache')))
  }

  public start() {
    this.emit('ready')
  }

  public stop() {
    this.emit('dispose')
  }
}

export type Core = Context

export const Core = Context

export type Service<T extends object = object> = FluoroService<T, Context>

export declare const Service: new <T extends object = object>(ctx: Context, config: T, identity: string) => Service<T>

export default Core
