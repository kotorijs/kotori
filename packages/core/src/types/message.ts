import Tsu from 'tsukiko'
import type { TsuError } from 'tsukiko'
import type { Context, EventsList } from 'fluoro'
import type CommandError from '../utils/commandError'
import type { Api } from '../service'
import type { Command } from '../utils/command'
import type { Session } from '../utils/session'

declare module 'fluoro' {
  interface EventsMapping {
    before_parse(data: EventDataBeforeParse): void
    parse(data: EventDataParse): void
    before_command(data: EventDataBeforeCommand): void
    command(data: EventDataCommand): void
    before_regexp(data: EventDataBeforeRegexp): void
    regexp(data: EventDataRegexp): void
    before_send(data: EventDataBeforeSend): void
    send(data: EventDataSend): void
    on_message(session: Session<EventDataPrivateMsg | EventDataGroupMsg>): void
    on_recall(session: Session<EventDataPrivateRecall | EventDataGroupRecall>): void
    on_request(session: Session<EventDataPrivateRequest | EventDataGroupRequest>): void
    on_private_add(session: Session<EventDataPrivateAdd>): void
    on_group_increase(session: Session<EventDataGroupIncrease>): void
    on_group_decrease(session: Session<EventDataGroupDecrease>): void
    on_group_admin(session: Session<EventDataGroupAdmin>): void
    on_group_ban(session: Session<EventDataGroupBan>): void
  }
}

export enum FilterTestList {
  PLATFORM = 'platform',
  USER_ID = 'userId',
  GROUP_ID = 'groupId',
  OPERATOR_ID = 'operatorId',
  MESSAGE_ID = 'messageId',
  SCOPE = 'scope',
  ACCESS = 'access',
  IDENTITY = 'identity',
  LOCALE_TYPE = 'localeType',
  SELF_ID = 'selfId'
}

export type FilterOption = FilterOptionBase | FilterOptionGroup

export interface FilterOptionBase {
  test: FilterTestList
  operator: '==' | '!=' | '>' | '<' | '>=' | '<='
  value: string | number | boolean
}

export interface FilterOptionGroup {
  type: 'all_of' | 'any_of' | 'none_of'
  filters: FilterOption[]
}

export enum CommandAccess {
  MEMBER = 0,
  MANGER = 1,
  ADMIN = 2
}

export type ArgsOrigin = CommandArgType[]
export type OptsOrigin = Record<string, CommandArgType>

export type CommandAction<Args = ArgsOrigin, Opts = OptsOrigin> = (
  data: { args: Args; options: Opts },
  session: SessionData
) => MessageQuick

export type CommandArgType = string | number | boolean /* object<json> */
export const commandArgTypeSignSchema = Tsu.Union(Tsu.Literal('string'), Tsu.Literal('number'), Tsu.Literal('boolean'))
export type CommandArgTypeSign = Tsu.infer<typeof commandArgTypeSignSchema>

export interface CommandConfig {
  alias?: string[]
  scope?: MessageScope | 'all'
  access?: CommandAccess
  help?: string
  action?: CommandAction
}

interface CommandParseResult {
  option_error: { expected: CommandArgTypeSign; reality: CommandArgTypeSign; target: string }
  arg_error: { expected: CommandArgTypeSign; reality: CommandArgTypeSign; index: number }
  arg_many: { expected: number; reality: number }
  arg_few: CommandParseResult['arg_many']
  syntax: { index: number; char: string }
  unknown: { input: string }
}

export interface CommandResult extends CommandParseResult {
  error: { error: unknown }
  data_error: { target: string | number }
  res_error: { error: TsuError }
  num_error: null
  no_access_manger: null
  no_access_admin: null
  disable: null
  exists: { target: string }
  no_exists: CommandResult['exists']
}

type CommandResultNoArgs = 'num_error' | 'no_access_manger' | 'no_access_admin' | 'disable'

export type CommandResultExtra = {
  [K in keyof CommandResult]: { type: K } & (K extends CommandResultNoArgs ? object : CommandResult[K])
}

export type SessionData = EventsList['on_message']
export enum MessageScope {
  PRIVATE = 0,
  GROUP = 1
}
export type MessageRaw = string
export type MessageQuickReal =
  | [string, (CommandArgType | undefined)[] | Record<string, CommandArgType | undefined>]
  | MessageRaw
  | CommandError
  // biome-ignore lint:
  | void

export type MessageQuick = MessageQuickReal | Promise<MessageQuickReal>
export type MidwareCallback = (next: () => void | Promise<void>, session: SessionData) => MessageQuick
export type RegexpCallback = (match: RegExpMatchArray, session: SessionData) => MessageQuick
export type TaskCallback = (ctx: Context) => void
export type TaskOptions = string | { cron: string; start?: boolean; timeZone?: string }

export type EventApiType = {
  [K in keyof EventsList]: EventsList[K] extends EventDataApiBase ? EventsList[K] : never
}

interface EventDataBeforeParse {
  session: SessionData
  raw: string
}

interface EventDataParse {
  session: SessionData
  command: Command
  raw: string
  result: CommandError | Parameters<CommandAction>[0]
  cancel(): void
}

interface EventDataBeforeCommand {
  session: SessionData
  raw: string
  cancel(): void
}

interface EventDataCommand {
  session: SessionData
  raw: string
  command: Command
  result: EventDataParse['result'] | MessageQuick
}

interface EventDataBeforeRegexp {
  session: SessionData
  raw: string
  regexp: RegExp
  cancel(): void
}

interface EventDataRegexp {
  session: SessionData
  raw: string
  regexp: RegExp
  result: RegExpMatchArray
}

interface EventDataBeforeSend {
  api: Api
  message: MessageRaw
  messageType: MessageScope
  targetId: string
  cancel(): void
}

interface EventDataSend {
  api: Api
  messageId: string
}

interface SessionDataSender {
  nickname: string
  sex: 'male' | 'female' | 'unknown'
  age: number
}

export interface EventDataApiBase {
  type: MessageScope
  time: number
  userId: string
  messageId?: string
  groupId?: string
  operatorId?: string
  // biome-ignore lint:
  meta?: any
}

interface EventDataPrivateMsg extends EventDataApiBase {
  type: MessageScope.PRIVATE
  messageId: string
  message: MessageRaw
  sender: SessionDataSender
}

interface EventDataGroupMsg extends EventDataPrivateMsg {
  groupId: string
}

interface EventDataPrivateRecall extends EventDataApiBase {
  type: MessageScope.PRIVATE
  messageId: string
}

interface EventDataGroupRecall extends EventDataApiBase {
  messageId: string
  operatorId: string
  groupId: string
}

interface EventDataPrivateRequest extends EventDataApiBase {
  type: MessageScope.PRIVATE
  userId: string
}

interface EventDataGroupRequest extends EventDataApiBase {
  type: MessageScope.GROUP
  userId: string
  operatorId: string
  groupId: string
}

interface EventDataPrivateAdd extends EventDataApiBase {
  userId: string
}

interface EventDataGroupIncrease extends EventDataApiBase {
  userId: string
  operatorId: string
  groupId: string
}

interface EventDataGroupDecrease extends EventDataApiBase {
  userId: string
  operatorId: string
  groupId: string
}

interface EventDataGroupAdmin extends EventDataApiBase {
  userId: string
  operation: 'set' | 'unset'
  groupId: string
}

interface EventDataGroupBan extends EventDataApiBase {
  // TODO:update all adapters
  userId: string | 'all'
  operatorId: string
  duration: number
  groupId: string
}
