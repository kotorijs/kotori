import type { Context } from 'fluoro'
import type Api from './api'
import { MessageScope, type AdapterConfig, type EventApiType } from '../types'
import type Elements from './elements'
import { cancelFactory } from '../utils/factory'
import { Session } from '../utils/session'

interface AdapterStatus {
  value: 'online' | 'offline'
  createTime: Date
  lastMsgTime: Date | null
  receivedMsg: number
  sentMsg: number
  offlineTimes: number
}

export interface Adapter<T extends Api = Api, C extends AdapterConfig = AdapterConfig> {
  readonly ctx: Context
  readonly config: C
  readonly platform: string
  readonly selfId: string
  readonly identity: string
  readonly api: T
  readonly elements: Elements
  readonly status: AdapterStatus
  handle(...data: unknown[]): void
  start(): void
  stop(): void
}

function setProxy<T extends Api>(api: T, ctx: Context): T {
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

abstract class AdapterOrigin<T extends Api = Api, C extends AdapterConfig = AdapterConfig> implements Adapter<T, C> {
  public constructor(ctx: Context, config: C, identity: string) {
    this.ctx = ctx
    this.config = config
    this.identity = identity
  }

  public abstract readonly platform: string

  public abstract readonly api: T

  public abstract readonly elements: Elements

  public abstract handle(...data: unknown[]): void

  public abstract start(): void

  public abstract stop(): void

  // biome-ignore lint:
  public abstract send(action: string, params?: object): void | object | Promise<unknown> | null | undefined

  protected online() {
    if (this.status.value !== 'offline') return
    this.status.value = 'online'
    this.ctx.emit('status', { adapter: this, status: 'online' })
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
