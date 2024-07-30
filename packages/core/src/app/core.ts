import { Http } from '@kotori-bot/tools'
import I18n from '@kotori-bot/i18n'
import type { Parser } from 'tsukiko'
import Context from 'fluoro'
import Config from './config'
import Message from './message'
import type { AdapterClass } from '../types'
import { Cache, type Api, type Session } from '../components'
import { Symbols } from '../global'
import { getCommandMeta, getRegExpMeta } from '../utils/internal'

declare module 'fluoro' {
  interface Context {
    /* Core */
    /**
     * Adapter constructors list.
     *
     * @readonly
     */
    readonly [Symbols.adapter]: Core[typeof Symbols.adapter]
    /**
     * Bot instances list.
     *
     * @readonly
     */
    readonly [Symbols.bot]: Core[typeof Symbols.bot]
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
}

function initialize(ctx: Context) {
  function test(identity: string, session: Session) {
    for (const [key, filter] of ctx[Symbols.filter].entries()) if (key === identity) return filter.test(session)
    return true
  }

  ctx.midware((next, session) => {
    //  Throttle valve for `session.prompt()` and ``session.confirm()`
    if (session.id in ctx[Symbols.promise]) return
    next()
  })

  ctx.on('before_command', (data) => {
    const { identity } = getCommandMeta(data.command) ?? {}
    if (identity && !test(identity, data.session)) data.cancel()
  })

  ctx.on('before_regexp', (data) => {
    const { callback } = Array.from(ctx[Symbols.regexp]).find(({ match }) => match === data.regexp) ?? {}
    if (!callback) return
    const { identity } = getRegExpMeta(callback) ?? {}
    if (identity && !test(identity, data.session)) data.cancel()
  })
}

export class Core extends Context<Core> {
  public readonly [Symbols.adapter]: Map<string, [AdapterClass, Parser<unknown>?]> = new Map()

  public readonly [Symbols.bot]: Map<string, Set<Api>> = new Map()

  public constructor(config?: ConstructorParameters<typeof Config>[0]) {
    super()
    this.provide('config', new Config(config))
    this.mixin('config', ['config', 'meta'])
    this.provide('message', new Message(this))
    this.mixin('message', ['midware', 'command', 'regexp', 'notify', 'task'])
    this.provide('http', new Http({ validateStatus: () => true }))
    this.inject('http')
    this.provide('i18n', new I18n({ lang: this.config.global.lang }))
    this.inject('i18n')
    this.service('cache', new Cache(this.extends()))
    initialize(this)
  }
}

export default Core
