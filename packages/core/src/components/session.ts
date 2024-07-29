import {
  type CommandArgType,
  type EventDataApiBase,
  type Message,
  MessageScope,
  type MessageQuick,
  type CommandResult
} from '../types'
import type { Adapter } from './adapter'
import { formatFactory } from '../utils/factory'
import { CommandError } from '../utils/error'
import type { EventsMapping } from 'fluoro'
import type { Api } from './api'
import type { Elements } from './elements'
import type { I18n } from '@kotori-bot/i18n'
import { Symbols } from '../global'
import { MessageList, MessageSingle } from './messages'

class SessionOrigin<T extends EventDataApiBase = EventDataApiBase> implements EventDataApiBase {
  private isSameSender(session: SessionOrigin) {
    return (
      this.api.adapter.identity === session.api.adapter.identity &&
      this.api.adapter.platform === session.api.adapter.platform &&
      this.type === session.type &&
      this.groupId === session.groupId &&
      this.userId === session.userId &&
      'messageId' in session &&
      this.messageId !== session.messageId
    )
  }

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
  public format(template: string, data: Record<string, CommandArgType | undefined> | (CommandArgType | undefined)[]) {
    return formatFactory(this.i18n)(template, data)
  }

  /**
   * Send message to current session, it's packed base on `session.send()`, `session.i18n` and `session.format()`.
   *
   * @param message
   * @returns
   *
   * @async
   */
  public async quick(message: MessageQuick) {
    const msg = await message
    if (!msg || msg instanceof CommandError) return
    if (typeof msg === 'string' || msg instanceof MessageSingle || msg instanceof MessageList) {
      this.send(this.i18n.locale(msg.toString()))
      return
    }
    this.send(this.format(...msg))
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
    return new Promise((resolve) => {
      const handle: EventsMapping['on_message'] = (session) => {
        if (this.isSameSender(session as unknown as SessionOrigin)) {
          resolve(session.message)
          return
        }
        this.api.adapter.ctx.once('on_message', handle)
      }
      this.quick(message ?? 'corei18n.template.prompt').then(() => this.api.adapter.ctx.once('on_message', handle))
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
      const handle: EventsMapping['on_message'] = (session) => {
        if (this.isSameSender(session as unknown as SessionOrigin)) {
          resolve(session.message === (options?.sure ?? 'corei18n.template.confirm.sure'))
          return
        }
        this.api.adapter.ctx.once('on_message', handle)
      }
      this.quick(options?.message ?? 'corei18n.template.confirm').then(() =>
        this.api.adapter.ctx.once('on_message', handle)
      )
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

/**
 * Session event.
 *
 * @class
 * @template T - Session event data type
 */
export const Session = new Proxy(SessionOrigin, {
  construct: (target, args, newTarget) => Object.assign(args[0], Reflect.construct(target, args, newTarget))
}) as new <T extends EventDataApiBase = EventDataApiBase>(
  data: T,
  bot: Adapter
) => Session<T>
