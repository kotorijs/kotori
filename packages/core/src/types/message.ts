import type { obj } from '@kotori-bot/tools';
import Tsu from 'tsukiko';
import type { EventDataMsg } from './events';
import type { EventsList } from './context';
import CommandError from '../utils/commandError';

export const enum CommandAccess {
  MEMBER,
  MANGER,
  ADMIN
}

export type CommandAction = (
  data: { args: CommandArgType[]; options: obj<CommandArgType> },
  session: EventsList['group_msg' | 'private_msg']
) => MessageQuick;

export type CommandArgType = string | number | boolean /* object<json> */;
export const commandArgTypeSignSchema = Tsu.Union([
  Tsu.Union([Tsu.Literal('string'), Tsu.Literal('number')]),
  Tsu.Literal('boolean')
]);
export type CommandArgTypeSign = Tsu.infer<typeof commandArgTypeSignSchema>;

export interface CommandConfig {
  alias?: string[];
  scope?: MessageScope | 'all';
  access?: CommandAccess;
  help?: string;
  action?: CommandAction;
}

export interface CommandArg {
  name: string;
  type: CommandArgTypeSign;
  optional: boolean;
  default?: CommandArgType;
  rest: boolean;
}

export interface CommandOption {
  name: string; // short name
  type: CommandArgTypeSign;
  realname: string; // full name
  description?: string;
}

export interface CommandData {
  root: string;
  alias: string[];
  args: CommandArg[];
  options: CommandOption[];
  scope: CommandConfig['scope'];
  access: CommandAccess;
  help?: string;
  action?: CommandAction;
  description?: string;
}

interface CommandParseResult {
  /*   parsed: {
    action: CommandAction;
    args: CommandArgType[];
    options: obj<CommandArgType>;
  }; */
  option_error: { expected: CommandArgTypeSign; reality: CommandArgTypeSign; target: string };
  arg_error: { expected: CommandArgTypeSign; reality: CommandArgTypeSign; index: number };
  arg_many: { expected: number; reality: number };
  arg_few: CommandParseResult['arg_many'];
  syntax: { index: number; char: string };
  unknown: { input: string };
}

export interface CommandResult extends CommandParseResult {
  success: { return?: string };
  error: { error: unknown };
}

export type CommandResultExtra = {
  [K in keyof CommandResult]: { type: K } & CommandResult[K];
};

export type MessageRaw = string;
export type MessageScope = 'private' | 'group';
export type MessageQuickReal = MessageRaw | [string, obj<CommandArgType | void>] | CommandError | void;
export type MessageQuick = MessageQuickReal | Promise<MessageQuickReal>;

export type MidwareCallback = (next: () => void, session: EventDataMsg) => MessageQuick;
export type RegexpCallback = (match: RegExpMatchArray, session: EventDataMsg) => MessageQuick;
