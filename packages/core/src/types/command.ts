import Tsu from 'tsukiko'
import type { TsuError } from 'tsukiko'
import type { MessageQuick, MessageScope, UserAccess } from './message'
import type { SessionMsg, SessionMsgChannel, SessionMsgGroup, SessionMsgPrivate } from '../components'

export type ArgsOrigin = CommandArgType[]
export type OptsOrigin = Record<string, CommandArgType>

export type CommandAction<Args = ArgsOrigin, Opts = OptsOrigin, Scope = 'all'> = (
  data: { args: Args; options: Opts },
  session: Scope extends MessageScope.PRIVATE
    ? SessionMsgPrivate
    : Scope extends MessageScope.GROUP
      ? SessionMsgGroup
      : Scope extends MessageScope.CHANNEL
        ? SessionMsgChannel
        : SessionMsg
) => MessageQuick

export type CommandArgType = string | number | boolean /* object<json> */
export const commandArgTypeSignSchema = Tsu.Union(Tsu.Literal('string'), Tsu.Literal('number'), Tsu.Literal('boolean'))
export type CommandArgTypeSign = Tsu.infer<typeof commandArgTypeSignSchema>

/** Command instance config */
export interface CommandConfig {
  /** Command alias (need bring command prefix) */
  alias?: string[]
  /** Command shortcut (needn't bring command prefix) */
  shortcut?: string[]
  /** Command required message scope (session type) */
  scope?: MessageScope | 'all'
  /** Command required user access level */
  access?: UserAccess
  /** Command help message (have more details than command description) */
  help?: string
  /** Command action */
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
