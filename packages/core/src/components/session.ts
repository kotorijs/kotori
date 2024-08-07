import {
  type EventDataApiBase,
  type Message,
  MessageScope,
  type MessageQuick,
  type CommandResult,
  type EventDataPrivateMsg,
  type EventDataGroupMsg,
  type EventDataChannelMsg
} from '../types'
import type { Adapter } from './adapter'
import { formatFactory } from '../utils/factory'
import { CommandError } from '../utils/error'
import type { Api } from './api'
import type { Elements } from './elements'
import type { I18n } from '@kotori-bot/i18n'
import { Symbols } from '../global'
import { MessageList, MessageSingle } from './messages'

class SessionOrigin<T extends EventDataApiBase = EventDataApiBase> implements EventDataApiBase {
  /**
   * Api instance of current session.
   *
   * @readonly
   */
  public readonly api: Api

  /**
   * Elements instance of current session.
   *
   * @readonly
   */
  public readonly el: Elements

  /**
   * I18n instance of current session.
   *
   * @readonly
   */
  public readonly i18n: I18n

  /**
   * Session unique id, generated base on `type`. `userId`, `groupId`, `guildId`, `channelId`.
   *
   * @readonly
   */
  public readonly id: string

  /**
   * Send message to current session.
   *
   * @param message - Message to send
   * @returns Message id and sent time
   */
  public async send(message: Message) {
    if (this.type === MessageScope.GROUP) {
      return await this.api.sendGroupMsg(message, this.groupId as string, this.meta)
    }
    if (this.type === MessageScope.CHANNEL) {
      return await this.api.sendChannelMsg(message, this.guildId as string, this.channelId as string, this.meta)
    }
    if (this.type === MessageScope.PRIVATE) {
      return await this.api.sendPrivateMsg(message, this.userId as string, this.meta)
    }
    return { messageId: '', time: 0 }
  }

  /**
   * Format message template with data.
   *
   * @param template - Message template
   * @param data - Data to format
   * @returns Formatted message
   */
  public readonly format: ReturnType<typeof formatFactory>

  /**
   * Send message to current session, it's packed base on `session.send()`, `session.i18n` and `session.format()`.
   *
   * @param message - Message to send
   * @returns Message id and sent time
   *
   * @async
   */
  public async quick(message: MessageQuick) {
    const msg = await message
    if (!msg || msg instanceof CommandError) return
    if (msg instanceof MessageList && (msg.toString() === '' || msg.pick('text').length === 0)) {
      this.send(msg)
      return
    }
    if (typeof msg === 'string' || msg instanceof MessageSingle || msg instanceof MessageList) {
      this.send(typeof msg === 'string' ? this.i18n.locale(msg) : msg)
      return
    }
    this.send(this.format(msg[0], msg[1] as Parameters<this['format']>[1]))
  }

  /**
   * Get message from current session.
   *
   * @param message - Message to get
   * @returns Message id and sent time
   */
  public async json(message: unknown) {
    if (typeof message === 'string') return this.send(message)
    if (message && typeof message === 'object') {
      const result = JSON.stringify(message, undefined, 2)
      if (result === '{}') return this.send(String(message))
      return result
    }
    if (typeof message === 'function') {
      return `[${message.toString().slice(0, 5) === 'class' ? 'class' : 'Function'} ${message.name || '(anonymous)'}]`
    }
    return this.send(String(message))
  }

  /**
   * Prompt message to current session.
   *
   * @param message - Message to prompt
   * @returns Message from current session
   *
   * @async
   */
  public prompt(message?: Message): Promise<Message> {
    return new Promise<Message>((resolve) => {
      this.api.adapter.ctx[Symbols.promise].set(this.id, [
        ...(this.api.adapter.ctx[Symbols.promise].get(this.id) ?? []),
        resolve
      ])
      this.quick(message ?? 'corei18n.template.prompt').then(() => {})
    }).finally(() => this.api.adapter.ctx[Symbols.promise].delete(this.id)) as Promise<Message>
  }

  /**
   * Confirm message to current session.
   *
   * @param options - Options to confirm
   * @returns Message from current session
   *
   * @async
   */
  public confirm(options?: { message: Message; sure: Message }): Promise<boolean> {
    return new Promise((resolve) => {
      this.api.adapter.ctx[Symbols.promise].set(this.id, [
        ...(this.api.adapter.ctx[Symbols.promise].get(this.id) ?? []),
        (message: Message) => resolve(message === (options?.sure ?? 'corei18n.template.confirm.sure'))
      ])
      this.quick(options?.message ?? 'corei18n.template.confirm').then(() => {})
    }).finally(() => this.api.adapter.ctx[Symbols.promise].delete(this.id)) as Promise<boolean>
  }

  /**
   * Create a command error.
   *
   * @param type - Error type
   * @param data - Error data
   * @returns Command error
   */
  public error<K extends keyof CommandResult>(type: K, data?: CommandResult[K]) {
    return new CommandError(Object.assign(data ?? {}, { type }) as ConstructorParameters<typeof CommandError>[0])
  }

  /**
   * Session type
   *
   * @readonly
   */
  public readonly type: EventDataApiBase['type']

  /**
   * Session time, milliseconds timestamp.
   *
   * @readonly
   */
  public readonly time: number

  /**
   * Session related user id if exists.
   *
   * @readonly
   */
  public readonly userId?: string

  /**
   * Session related operator id if exists.
   *
   * @readonly
   */
  public readonly operatorId?: string

  /**
   * Session related message id if exists.
   *
   * @readonly
   */
  public readonly messageId?: string

  /**
   * Session related group id if exists.
   *
   * @readonly
   */
  public readonly groupId?: string

  /**
   * Session related channel id if exists.
   *
   * @readonly
   */
  public readonly channelId?: string

  /**
   * Session related guild id if exists.
   *
   * @readonly
   */
  public readonly guildId?: string

  /**
   * Session related meta data if exists, it is customized by the specific adapter.
   *
   * @readonly
   */
  public readonly meta?: EventDataApiBase['meta']

  /**
   * Create a session instance.
   *
   * @param data - Session data
   * @param adapter - Adapter instance
   *
   * @constructor
   */
  public constructor(data: T, adapter: Adapter) {
    this.api = adapter.api
    this.el = adapter.elements
    this.i18n = adapter.ctx.i18n.extends(adapter.config.lang) as I18n
    this.type = data.type
    this.userId = data.userId
    this.groupId = data.groupId
    this.operatorId = data.operatorId
    this.time = data.time
    this.meta = data.meta
    switch (this.type) {
      case MessageScope.PRIVATE:
        this.id = `${MessageScope.PRIVATE}|${this.userId}`
        break
      case MessageScope.GROUP:
        this.id = `${MessageScope.GROUP}|${this.groupId}|${this.userId}`
        break
      case MessageScope.CHANNEL:
        this.id = `${MessageScope.CHANNEL}|${this.channelId}|${this.guildId}|${this.userId}`
        break
    }
    this.format = formatFactory(this.i18n)
  }
}

/**
 * Session instance.
 *
 * @class Session
 * @extends {SessionOrigin}
 * @template T
 */
export type Session<T extends EventDataApiBase = EventDataApiBase> = SessionOrigin<T> & T
export type SessionMsg = Session<EventDataPrivateMsg | EventDataGroupMsg | EventDataChannelMsg>
export type SessionMsgPrivate = Session<EventDataPrivateMsg>
export type SessionMsgGroup = Session<EventDataGroupMsg>
export type SessionMsgChannel = Session<EventDataChannelMsg>

/**
 * Session event.
 *
 * @class
 * @template T - Session event data type
 */
export const Session = new Proxy(SessionOrigin, {
  construct: (target, args, newTarget) =>
    new Proxy(Reflect.construct(target, args, newTarget), {
      get: (target, prop, receiver) => {
        const result = Reflect.get(target, prop, receiver)
        return result === undefined ? args[0][prop] : result
      }
    })
}) as new <T extends EventDataApiBase = EventDataApiBase>(
  data: T,
  bot: Adapter
) => Session<T>
