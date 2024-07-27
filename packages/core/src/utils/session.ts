import {
  type CommandArgType,
  type EventDataApiBase,
  type MessageRaw,
  MessageScope,
  type MessageQuick,
  type CommandResult
} from '../types'
import type { Adapter } from '../service/adapter'
import { formatFactory } from './factory'
import { CommandError } from './commandError'
import type { EventsMapping } from 'fluoro'
import type { Api } from '../service/api'
import type { Elements } from '../service/elements'
import type { I18n } from '@kotori-bot/i18n'
import { Symbols } from '..'

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

  public readonly api: Api

  public readonly el: Elements

  public readonly i18n: I18n

  public readonly id: string

  public send(message: MessageRaw) {
    if (this.type === MessageScope.GROUP) {
      this.api.sendGroupMsg(message, this.groupId as string, this.meta)
    }
    this.api.sendPrivateMsg(message, this.userId, this.meta)
  }

  public format(template: string, data: Record<string, CommandArgType | undefined> | (CommandArgType | undefined)[]) {
    return formatFactory(this.i18n)(template, data)
  }

  public async quick(message: MessageQuick) {
    const msg = await message
    if (!msg || msg instanceof CommandError) return
    if (typeof msg === 'string') {
      this.send(this.i18n.locale(msg))
      return
    }
    this.send(this.format(...msg))
  }

  public prompt(message?: MessageRaw): Promise<MessageRaw> {
    return new Promise((resolve) => {
      const handle: EventsMapping['on_message'] = (session) => {
        if (this.isSameSender(session as unknown as SessionOrigin)) {
          resolve(session.message)
          return
        }
        this.api.adapter.ctx.once('on_message', handle)
      }
      this.quick(message ?? 'corei18n.template.prompt').then(() => this.api.adapter.ctx.once('on_message', handle))
    }).finally(() => this.api.adapter.ctx[Symbols.promise].delete(this.id)) as Promise<MessageRaw>
  }

  public confirm(options?: { message: MessageRaw; sure: MessageRaw }): Promise<boolean> {
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

  public error<K extends keyof CommandResult>(type: K, data?: CommandResult[K]) {
    return new CommandError(Object.assign(data ?? {}, { type }) as ConstructorParameters<typeof CommandError>[0])
  }

  public readonly type: EventDataApiBase['type']

  public readonly time: number

  public readonly userId: string

  public readonly operatorId?: string

  public readonly messageId?: string

  public readonly groupId?: string

  public readonly channelId?: string

  public readonly guildId?: string

  public readonly meta?: EventDataApiBase['meta']

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

  public getUnique() {}
}

export type Session<T extends EventDataApiBase = EventDataApiBase> = SessionOrigin<T> & T

export const Session = new Proxy(SessionOrigin, {
  construct: (target, args, newTarget) => Object.assign(args[0], Reflect.construct(target, args, newTarget))
}) as new <T extends EventDataApiBase = EventDataApiBase>(
  data: T,
  bot: Adapter
) => Session<T>
