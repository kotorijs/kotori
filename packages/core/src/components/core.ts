import { Http } from '@kotori-bot/tools'
import I18n from '@kotori-bot/i18n'
import type { Parser } from 'tsukiko'
import { Context } from 'fluoro'
import Config from './config'
import Message from './message'
import type { AdapterClass, SessionData } from '../types'
import { Cache, type Api } from '../service'
import { Symbols } from '../global'
import { getCommandMeta, getRegExpMeta } from '../utils/meta'

declare module 'fluoro' {
  interface Context {
    /* Core */
    readonly [Symbols.adapter]: Core[typeof Symbols.adapter]
    readonly [Symbols.bot]: Core[typeof Symbols.bot]
    /* Config */
    readonly config: Config['config']
    readonly meta: Config['meta']
    /* Message */
    readonly [Symbols.midware]: Message[typeof Symbols.midware]
    readonly [Symbols.command]: Message[typeof Symbols.command]
    readonly [Symbols.regexp]: Message[typeof Symbols.regexp]
    readonly [Symbols.task]: Message[typeof Symbols.task]
    readonly [Symbols.filter]: Message[typeof Symbols.filter]
    midware: Message['midware']
    command: Message['command']
    regexp: Message['regexp']
    notify: Message['notify']
    boardcast: Message['boardcast']
    task: Message['task']
    filter: Message['filter']
    /* Inject */
    http: Http
    i18n: I18n
    /* Service */
    cache: Cache
  }
}

function initialize(ctx: Context) {
  function test(identity: string, session: SessionData) {
    for (const [key, filter] of ctx[Symbols.filter].entries()) if (key === identity) return filter.test(session)
    return true
  }

  ctx.on('parse', (data) => {
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

export class Core extends Context {
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
