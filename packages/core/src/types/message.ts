import type { CommandError } from '../utils/error'
import type { Api, Command, MessageList, MessageSingle, SessionMsg } from '../components'
import type { CommandAction, CommandArgType } from './command'
import type { Context } from '../app'

declare module './events' {
  interface EventsMapping {
    before_command(data: EventDataBeforeCommand): void
    /**
     * Event after command running.
     *
     * @param data - Event data
     */
    command(data: EventDataCommand): void
    /**
     * Event before regexp.
     *
     * @param data - Event data
     */
    before_regexp(data: EventDataBeforeRegexp): void
    /**
     * Event after regexp.
     *
     * @param data - Event data
     */
    regexp(data: EventDataRegexp): void
    /**
     * Event before message send.
     *
     * @param data - Event data
     */
    before_send(data: EventDataBeforeSend): void
    /**
     * Event after message send.
     *
     * @param data - Event data
     */
    send(data: EventDataSend): void
  }
}

/** User access */
export enum UserAccess {
  /** Normal member */
  MEMBER = 0,
  /** Manager (group owner and group mangers) */
  MANGER = 1,
  /** Admin (master of bot instance) */
  ADMIN = 2
}

/** Message scope (session type) */
export enum MessageScope {
  /** Private message */
  PRIVATE = 0,
  /** Group message */
  GROUP = 1,
  /** Channel message */
  CHANNEL = 2
}

export interface MessageMapping {
  text: { text: string }
  mention: { userId: string }
  // biome-ignore lint:
  mentionAll: {}
  image: { content: string }
  voice: { content: string }
  audio: { content: string }
  video: { content: string }
  file: { content: string }
  location: {
    latitude: number
    longitude: number
    title: string
    content: string
  }
  reply: {
    messageId: string
  }
}

export type Message<T extends keyof MessageMapping = keyof MessageMapping> =
  | MessageSingle<T | 'text'>
  | MessageList<T | 'text'>
  | string

export type MessageQuickReal =
  | [string, (Message | CommandArgType | undefined)[] | Record<string, CommandArgType | undefined>]
  | Message
  // biome-ignore lint:
  | void

export type MessageQuick = MessageQuickReal | Promise<MessageQuickReal>

export type MidwareCallback = (next: () => void | Promise<void>, session: SessionMsg) => MessageQuick

export type RegexpCallback = (match: RegExpMatchArray, session: SessionMsg) => MessageQuick

export type TaskCallback = (ctx: Context) => void

export type TaskOptions = string | { cron: string; start?: boolean; timeZone?: string }

/** Event data before command running */
interface EventDataBeforeCommand {
  /** Session instance */
  session: SessionMsg
  /** Target command instance */
  command: Command
  /** Raw text message */
  raw: string
  /** Parsed result, command error or command data (args and options) */
  result: CommandError | Parameters<CommandAction>[0]
  /** Cancel the command running */
  cancel(): void
}

/** Event data after command running */
interface EventDataCommand {
  /** Session instance */
  session: SessionMsg
  /** Raw text message */
  raw: string
  /** Target command instance */
  command: Command
  /** Command running result, running error or back message */
  result: EventDataBeforeCommand['result'] | MessageQuick
}

/** Event data before regexp running */
interface EventDataBeforeRegexp {
  /** Session instance */
  session: SessionMsg
  /** Raw text message */
  raw: string
  /** Target regexp instance */
  regexp: RegExp
  /** Cancel the regexp running */
  cancel(): void
}

/** Event data after regexp running */
interface EventDataRegexp {
  /** Session instance */
  session: SessionMsg
  /** Raw text message */
  raw: string
  /** Target regexp instance */
  regexp: RegExp
  /** Match result */
  result: RegExpMatchArray
}

/** Event data before message sending */
interface EventDataBeforeSend {
  /** Api instance  */
  api: Api
  /** Message to send */
  message: Message
  /** Target user or group or channel */
  target:
    | {
        type: MessageScope.PRIVATE
        userId: string
      }
    | {
        type: MessageScope.GROUP
        groupId: string
      }
    | {
        type: MessageScope.CHANNEL
        channelId: string
        guildId: string
      }
  /** Cancel the message sending */
  cancel(): void
}

/** Event data after message sending */
interface EventDataSend {
  /** Api instance  */
  api: Api
  /** Message id */
  messageId: string
}
