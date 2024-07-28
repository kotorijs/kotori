import type { Context, EventsList } from 'fluoro'
import type Api from './api'
import { MessageScope, type AdapterConfig, type EventDataApiBase } from '../types'
import type Elements from './elements'
import { cancelFactory } from '../utils/internal'
import { Session } from './session'

export type EventApiType = {
  [K in keyof EventsList]: EventsList[K] extends EventDataApiBase ? EventsList[K] : never
}

/** Bot Status */
interface AdapterStatus {
  /** Online status */
  value: 'online' | 'offline'
  /** Bot create time */
  createTime: Date
  /** Bot last sending message time, or empty if haven't received message */
  lastMsgTime: Date | null
  /** Received message count */
  receivedMsg: number
  /** Sent message count */
  sentMsg: number
  /** Offline times */
  offlineTimes: number
}

/**
 * Platform adapter.
 *
 * @template A - Api instance of bot bind
 * @template C - Adapter config
 * @template E - Elements instance of bot bind
 *
 * @class
 * @abstract
 */
export interface Adapter<A extends Api = Api, C extends AdapterConfig = AdapterConfig, E extends Elements = Elements> {
  /**
   * Context instance.
   *
   * @readonly
   */
  readonly ctx: Context
  /**
   * Adapter config.
   *
   * @readonly
   */
  readonly config: C
  /**
   * Adapter support platform.
   *
   * @readonly
   */
  readonly platform: string
  /**
   * Platform id of bot instanceof itself.
   *
   * @readonly
   */
  readonly selfId: string
  /**
   * Unique identity of bot.
   *
   * @readonly
   */
  readonly identity: string
  /**
   * Api instance of bot bind.
   *
   * @readonly
   */
  readonly api: A
  /**
   * Elements instance of bot bind.
   *
   * @readonly
   */
  readonly elements: E
  /**
   * Bot status.
   *
   * @readonly
   */
  readonly status: AdapterStatus
  /**
   * Handle interactive data from platform.
   *
   * @param data - Data from platform.
   */
  handle(...data: unknown[]): void
  /**
   * Start bot.
   */
  start(): void
  /**
   * Stop bot.
   */
  stop(): void
  /**
   * Send interactive data to platform.
   *
   * @param data - Data to send.
   */
  send(...data: unknown[]): void
}

function setProxy<T extends Api>(api: T, ctx: Context): T {
  // TODO: modify them
  api.sendPrivateMsg = new Proxy(api.sendPrivateMsg, {
    apply(_, __, argArray) {
      const [message, targetId] = argArray
      const cancel = cancelFactory()
      ctx.emit('before_send', {
        api,
        message,
        messageType: MessageScope.PRIVATE,
        targetId,
        cancel: cancel.get()
      })
      if (cancel.value) return
      Reflect.apply(message, targetId, argArray[2])
    }
  })
  api.sendGroupMsg = new Proxy(api.sendGroupMsg, {
    apply(_, __, argArray) {
      const [message, targetId] = argArray
      const cancel = cancelFactory()
      ctx.emit('before_send', {
        api,
        message,
        messageType: MessageScope.PRIVATE,
        targetId,
        cancel: cancel.get()
      })
      if (cancel.value) return
      Reflect.apply(message, targetId, argArray[2])
    }
  })
  return api
}

abstract class AdapterOrigin<
  A extends Api = Api,
  C extends AdapterConfig = AdapterConfig,
  E extends Elements = Elements
> implements Adapter<A, C, E>
{
  public constructor(ctx: Context, config: C, identity: string) {
    this.ctx = ctx
    this.config = config
    this.identity = identity
  }

  public abstract readonly platform: string

  public abstract readonly api: A

  public abstract readonly elements: E

  public abstract handle(...data: unknown[]): void

  public abstract start(): void

  public abstract stop(): void

  public abstract send(...data: unknown[]): void

  protected online() {
    if (this.status.value !== 'offline') return
    this.status.value = 'online'
    this.ctx.emit('status', { adapter: this, status: 'online' })
    // this.session('before_command')
  }

  protected offline() {
    if (this.status.value !== 'online') return
    this.status.value = 'offline'
    this.status.offlineTimes += 1
    this.ctx.emit('status', { adapter: this, status: 'offline' })
  }

  protected session<N extends keyof EventApiType>(type: N, data: EventApiType[N] extends Session<infer U> ? U : never) {
    const session = new Session(data, this)
    this.ctx.emit(type, ...([session] as unknown as [...Parameters<(typeof this)['ctx']['emit']>]))
  }

  public readonly ctx: Context

  public readonly config: C

  public readonly identity: string

  public readonly status: AdapterStatus = {
    value: 'offline',
    createTime: new Date(),
    lastMsgTime: null,
    receivedMsg: 0,
    sentMsg: 0,
    offlineTimes: 0
  }

  public selfId = ''
}

export const Adapter = new Proxy(AdapterOrigin, {
  construct: (target, args, newTarget) => {
    const bot = Reflect.construct(target, args, newTarget)
    bot.api = setProxy(bot.api, bot.ctx)
    return bot
  }
})

export default Adapter
