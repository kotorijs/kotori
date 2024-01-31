import type { StringTempArgs, obj } from '@kotori-bot/tools';
import type { EventDataMsg } from './events';
import type { EventsList } from './context';

export const enum CommandAccess {
  MEMBER,
  MANGER,
  ADMIN
}

export type CommandAction = (
  data: { args: CommandArgType[]; options: obj<CommandArgType> },
  session: EventsList['group_msg' | 'private_msg']
) =>
  | MessageQuick
  | CommandResultExtra[keyof CommandResultExtra]
  | Promise<MessageQuick | CommandResultExtra[keyof CommandResultExtra]>;
export type CommandArgType = string | number;
export type CommandArgTypeSign = 'string' | 'number';

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
  name: string;
  type: CommandArgTypeSign;
  default?: CommandArgType;
  realname: string;
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
/* 
export enum CommandResult {
  SUCCESS = 0,
  OPTION_ERROR,
  ARG_ERROR,
  MANY_ARG,
  FEW_ARG,
  SYNTAX,
  UNKNOWN,
  ERROR,
} */
export interface CommandParseResult {
  parsed: {
    action: CommandAction;
    args: CommandArgType[];
    options: obj<CommandArgType>;
  };
  option_error: { expected: string; reality: string; target: string };
  arg_many: { expected: number; reality: number };
  arg_few: CommandParseResult['arg_many'];
  arg_error: CommandParseResult['option_error'];
  syntax: { index: number; char: string };
  unknown: { input: string };
}

export interface CommandResult extends CommandParseResult {
  success: { return?: string };
  error: { error: unknown };
}

export type CommandParseResultExtra = Pick<CommandResultExtra, keyof CommandParseResult>;
export type CommandExecuteResultExtra = Pick<
  CommandResultExtra,
  Exclude<keyof CommandResult, keyof CommandParseResult>
>;

export type CommandResultExtra = {
  [K in keyof CommandResult]: { type: K } & CommandResult[K];
};

export type MessageRaw = string;
export type MessageScope = 'private' | 'group';
export type MessageQuickFunc = (msg: MessageQuick) => void;
export type MessageQuickReal = MessageRaw | [string, StringTempArgs] | void;
export type MessageQuick = MessageQuickReal | Promise<MessageQuickReal>;

export type MidwareCallback = (next: () => void, session: EventDataMsg) => MessageQuick;
export type RegexpCallback = (match: RegExpMatchArray, session: EventDataMsg) => MessageQuick;
