import Tsu from 'tsukiko'
import type { TsuError } from 'tsukiko'
import type I18n from '@kotori-bot/i18n'
import type { Context, EventsList } from 'fluoro'
import type CommandError from '../utils/commandError'
import type { Api, Elements } from '../service'
import type { Command } from '../utils/command'

declare module 'fluoro' {
  interface EventsMapping {
    midwares(data: EventDataMidwares): void
    before_parse(data: EventDataBeforeParse): void
    parse(data: EventDataParse): void
    before_command(data: EventDataBeforeCommand): void
    command(data: EventDataCommand): void
    regexp(data: EventDataRegexp): void
    before_send(data: EventDataBeforeSend): void
    send(data: EventDataSend): void
    on_message(session: EventDataPrivateMsg | EventDataGroupMsg): void
    on_recall(session: EventDataPrivateRecall | EventDataGroupRecall): void
    on_request(session: EventDataPrivateRequest | EventDataGroupRequest): void
    on_private_add(session: EventDataPrivateAdd): void
    on_group_increase(session: EventDataGroupIncrease): void
    on_group_decrease(session: EventDataGroupDecrease): void
    on_group_admin(session: EventDataGroupAdmin): void
    on_group_ban(session: EventDataGroupBan): void
  }
}

export enum FilterTestList {
  PLATFORM = 'platform',
  USER_ID = 'userId',
  GROUP_ID = 'groupId',
  OPERATOR_ID = 'operatorId',
  MESSAGE_ID = 'messageId',
  MESSAGE_SCOPE = 'messageScope',
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
export type MidwareCallback = (next: () => void, session: SessionData) => MessageQuick
export type RegexpCallback = (match: RegExpMatchArray, session: SessionData) => MessageQuick
export type TaskCallback = (ctx: Context) => void

export type EventApiType = {
  [K in keyof EventsList]: EventsList[K] extends EventDataApiBase ? EventsList[K] : never
}

export const eventDataTargetIdSchema = Tsu.Union(Tsu.Number(), Tsu.String())
export type EventDataTargetId = Tsu.infer<typeof eventDataTargetIdSchema>

interface EventDataMidwares {
  isPass: boolean
  session: SessionData
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
  targetId: EventDataTargetId
  cancel(): void
}

interface EventDataSend {
  api: Api
  messageId: EventDataTargetId
}

interface SessionDataSender {
  nickname: string
  sex: 'male' | 'female' | 'unknown'
  age: number
}

export interface EventDataApiBase {
  type?: MessageScope
  api: Api
  el: Elements
  userId: EventDataTargetId
  groupId?: EventDataTargetId
  operatorId?: EventDataTargetId
  i18n: I18n
  send(message: MessageRaw): void
  format(template: string, data: Record<string, CommandArgType | undefined> | (CommandArgType | undefined)[]): string
  quick(message: MessageQuick): void
  prompt(message?: MessageRaw): Promise<MessageRaw>
  confirm(options?: { message: MessageRaw; sure: MessageRaw }): Promise<boolean>
  error<T extends Exclude<keyof CommandResult, CommandResultNoArgs>>(
    type: T,
    data: CommandResult[T] extends object ? CommandResult[T] : never
  ): CommandError
  error<T extends CommandResultNoArgs>(type: T): CommandError
  extra?: unknown
}

interface EventDataPrivateMsg extends EventDataApiBase {
  type: MessageScope.PRIVATE
  messageId: EventDataTargetId
  message: MessageRaw
  sender: SessionDataSender
}

interface EventDataGroupMsg extends EventDataApiBase {
  type: MessageScope.GROUP
  messageId: EventDataTargetId
  message: MessageRaw
  sender: SessionDataSender & { level: string; role: 'owner' | 'admin' | 'member'; title: string }
  groupId: EventDataTargetId
}

interface EventDataPrivateRecall extends EventDataApiBase {
  type: MessageScope.PRIVATE
  messageId: EventDataTargetId
}

interface EventDataGroupRecall extends EventDataApiBase {
  messageId: EventDataTargetId
  operatorId: EventDataTargetId
  groupId: EventDataTargetId
}

interface EventDataPrivateRequest extends EventDataApiBase {
  type: MessageScope.PRIVATE
  userId: EventDataTargetId
}

interface EventDataGroupRequest extends EventDataApiBase {
  type: MessageScope.GROUP
  userId: EventDataTargetId
  operatorId: EventDataTargetId
  groupId: EventDataTargetId
}

interface EventDataPrivateAdd extends EventDataApiBase {
  userId: EventDataTargetId
}

interface EventDataGroupIncrease extends EventDataApiBase {
  userId: EventDataTargetId
  operatorId: EventDataTargetId
  groupId: EventDataTargetId
}

interface EventDataGroupDecrease extends EventDataApiBase {
  userId: EventDataTargetId
  operatorId: EventDataTargetId
  groupId: EventDataTargetId
}

interface EventDataGroupAdmin extends EventDataApiBase {
  userId: EventDataTargetId
  operation: 'set' | 'unset'
  groupId: EventDataTargetId
}

interface EventDataGroupBan extends EventDataApiBase {
  userId: EventDataTargetId | 0
  operatorId: EventDataTargetId
  time: number | -1
  groupId: EventDataTargetId
}
