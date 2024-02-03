import type { obj } from '@kotori-bot/tools';
import Tsu, { TsuError } from 'tsukiko';
import type I18n from '@kotori-bot/i18n';
import type { EventDataBase, EventsList } from './core';
import type CommandError from '../utils/commandError';
import type { Api } from '../service';

declare module './core' {
  interface EventsList {
    midwares: EventDataMidwares;
    before_parse: EventDataBeforeParse;
    parse: EventDataParse;
    before_command: EventDataBeforeCommand;
    command: EventDataCommand;
    before_send: EventDataBeforeSend;
    send: EventDataSend;
    private_msg: EventDataPrivateMsg;
    group_msg: EventDataGroupMsg;
    private_recall: EventDataPrivateRecall;
    group_recall: EventDataGroupRecall;
    private_request: EventDataPrivateRequest;
    group_request: EventDataGroupRequest;
    private_add: EventDataPrivateAdd;
    group_increase: EventDataGroupIncrease;
    group_decrease: EventDataGroupDecrease;
    group_admin: EventDataGroupAdmin;
    group_ban: EventDataGroupBan;
  }
}

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
  error: { error: unknown };
  res_error: { error: TsuError };
  num_error: null;
  num_choose: null;
  no_access_manger: null;
  no_access_admin: null;
  disable: null;
  exists: { target: string };
  no_exists: CommandResult['exists'];
}

type CommandResultNoArgs = 'num_error' | 'num_choose' | 'no_access_manger' | 'no_access_admin' | 'disable';

export type CommandResultExtra = {
  [K in keyof CommandResult]: { type: K } & (K extends CommandResultNoArgs ? {} : CommandResult[K]);
};

export enum MessageScope {
  PRIVATE,
  GROUP
}
export type MessageRaw = string;
export type MessageQuickReal = MessageRaw | [string, obj<CommandArgType | void>] | CommandError | void;
export type MessageQuick = MessageQuickReal | Promise<MessageQuickReal>;
export type MidwareCallback = (next: () => void, session: EventDataMsg) => MessageQuick;
export type RegexpCallback = (match: RegExpMatchArray, session: EventDataMsg) => MessageQuick;

export type EventDataMsg = EventsList['group_msg'] | EventsList['private_msg'];
export const eventDataTargetIdSchema = Tsu.Union([Tsu.Number(), Tsu.String()]);
export type EventDataTargetId = Tsu.infer<typeof eventDataTargetIdSchema>;

interface EventDataMidwares extends EventDataBase<'midwares'> {
  isPass: boolean;
  event: EventDataMsg;
}

interface EventDataBeforeParse extends EventDataBase<'before_parse'> {
  event: EventDataMsg;
  command: string;
}

interface EventDataParse extends EventDataBase<'parse'> {
  event: EventDataMsg;
  command: string;
  result: CommandError | Parameters<CommandAction>[0];
  cancel(): void;
}

interface EventDataBeforeCommand extends EventDataBase<'before_command'> {
  event: EventDataMsg;
  command: string;
  scope: MessageScope;
  access: CommandAccess;
  cancel(): void;
}

interface EventDataCommand extends EventDataBase<'command'> {
  event: EventDataMsg;
  command: string;
  scope: MessageScope;
  access: CommandAccess;
  result: EventDataParse['result'] | MessageQuick;
}

interface EventDataBeforeSend extends EventDataBase<'before_send'> {
  api: Api;
  message: MessageRaw;
  messageType: MessageScope;
  targetId: EventDataTargetId;
  cancel(): void;
}

interface EventDataSend extends EventDataBase<'send'> {
  api: Api;
  messageId: EventDataTargetId;
}

interface EventDataMsgSender {
  nickname: string;
  sex: 'male' | 'female' | 'unknown';
  age: number;
}

export interface EventDataApiBase<T extends keyof EventsList, M extends MessageScope = MessageScope>
  extends EventDataBase<T> {
  api: Api;
  el: Api['elements'];
  userId: EventDataTargetId;
  messageType: M;
  i18n: I18n;
  send(message: MessageRaw): void;
  quick(message: MessageQuick): void;
  error<T extends Exclude<keyof CommandResult, CommandResultNoArgs>>(
    type: T,
    data: CommandResult[T] extends object ? CommandResult[T] : never
  ): CommandError;
  error<T extends CommandResultNoArgs>(type: T): CommandError;
  extra?: unknown;
}

interface EventDataPrivateMsg extends EventDataApiBase<'private_msg', MessageScope.PRIVATE> {
  messageId: EventDataTargetId;
  message: MessageRaw;
  // messageH?: object /* what is this? */;
  sender: EventDataMsgSender;
  groupId?: EventDataTargetId;
}

interface EventDataGroupMsg extends EventDataApiBase<'group_msg', MessageScope.GROUP> {
  messageId: EventDataTargetId;
  message: MessageRaw;
  sender: EventDataMsgSender;
  groupId: EventDataTargetId;
}

interface EventDataPrivateRecall extends EventDataApiBase<'private_recall', MessageScope.PRIVATE> {
  messageId: EventDataTargetId;
}

interface EventDataGroupRecall extends EventDataApiBase<'group_recall', MessageScope.GROUP> {
  messageId: EventDataTargetId;
  operatorId: EventDataTargetId;
  groupId: EventDataTargetId;
}

interface EventDataPrivateRequest extends EventDataApiBase<'private_request', MessageScope.PRIVATE> {
  userId: EventDataTargetId;
}

interface EventDataGroupRequest extends EventDataApiBase<'group_request', MessageScope.GROUP> {
  userId: EventDataTargetId;
  operatorId: EventDataTargetId;
  groupId: EventDataTargetId;
}

interface EventDataPrivateAdd extends EventDataApiBase<'private_add', MessageScope.PRIVATE> {
  userId: EventDataTargetId;
}

interface EventDataGroupIncrease extends EventDataApiBase<'group_increase', MessageScope.GROUP> {
  userId: EventDataTargetId;
  operatorId: EventDataTargetId;
  groupId: EventDataTargetId;
}

interface EventDataGroupDecrease extends EventDataApiBase<'group_decrease', MessageScope.GROUP> {
  userId: EventDataTargetId;
  operatorId: EventDataTargetId;
  groupId: EventDataTargetId;
}

interface EventDataGroupAdmin extends EventDataApiBase<'group_admin', MessageScope.GROUP> {
  userId: EventDataTargetId;
  operation: 'set' | 'unset';
  groupId: EventDataTargetId;
}

interface EventDataGroupBan extends EventDataApiBase<'group_ban', MessageScope.GROUP> {
  userId: EventDataTargetId | 0;
  operatorId?: EventDataTargetId;
  time?: number | -1;
  groupId: EventDataTargetId;
}
