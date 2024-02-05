import type { obj } from '@kotori-bot/tools';
import Tsu, { TsuError } from 'tsukiko';
import type I18n from '@kotori-bot/i18n';
import type { EventsList } from './core';
import type CommandError from '../utils/commandError';
import type { Api, Elements } from '../service';

declare module './core' {
  interface EventsMapping {
    midwares(data: EventDataMidwares): void;
    before_parse(data: EventDataBeforeParse): void;
    parse(data: EventDataParse): void;
    before_command(data: EventDataBeforeCommand): void;
    command(data: EventDataCommand): void;
    before_send(data: EventDataBeforeSend): void;
    send(data: EventDataSend): void;
    on_message(session: EventDataPrivateMsg | EventDataGroupMsg): void;
    on_recall(session: EventDataPrivateRecall | EventDataGroupRecall): void;
    on_request(session: EventDataPrivateRequest | EventDataGroupRequest): void;
    on_private_add(session: EventDataPrivateAdd): void;
    on_group_increase(session: EventDataGroupIncrease): void;
    on_group_decrease(session: EventDataGroupDecrease): void;
    on_group_admin(session: EventDataGroupAdmin): void;
    on_group_ban(session: EventDataGroupBan): void;
  }
}

export const enum CommandAccess {
  MEMBER,
  MANGER,
  ADMIN
}

export type CommandAction = (
  data: { args: CommandArgType[]; options: obj<CommandArgType> },
  session: SessionData
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

export type SessionData = EventsList['on_message'];
export enum MessageScope {
  PRIVATE,
  GROUP
}
export type MessageRaw = string;
export type MessageQuickReal = MessageRaw | [string, obj<CommandArgType | void>] | CommandError | void;
export type MessageQuick = MessageQuickReal | Promise<MessageQuickReal>;
export type MidwareCallback = (next: () => void, session: SessionData) => MessageQuick;
export type RegexpCallback = (match: RegExpMatchArray, session: SessionData) => MessageQuick;

export const eventDataTargetIdSchema = Tsu.Union([Tsu.Number(), Tsu.String()]);
export type EventDataTargetId = Tsu.infer<typeof eventDataTargetIdSchema>;

interface EventDataMidwares {
  isPass: boolean;
  session: SessionData;
}

interface EventDataBeforeParse {
  session: SessionData;
  command: string;
}

interface EventDataParse {
  session: SessionData;
  command: string;
  result: CommandError | Parameters<CommandAction>[0];
  cancel(): void;
}

interface EventDataBeforeCommand {
  session: SessionData;
  command: string;
  scope: MessageScope;
  access: CommandAccess;
  cancel(): void;
}

interface EventDataCommand {
  session: SessionData;
  command: string;
  scope: MessageScope;
  access: CommandAccess;
  result: EventDataParse['result'] | MessageQuick;
}

interface EventDataBeforeSend {
  api: Api;
  message: MessageRaw;
  messageType: MessageScope;
  targetId: EventDataTargetId;
  cancel(): void;
}

interface EventDataSend {
  api: Api;
  messageId: EventDataTargetId;
}

interface SessionDataSender {
  nickname: string;
  sex: 'male' | 'female' | 'unknown';
  age: number;
}

export interface EventDataApiBase {
  type?: MessageScope;
  api: Api;
  el: Elements;
  userId: EventDataTargetId;
  groupId?: EventDataTargetId;
  operatorId?: EventDataTargetId;
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

interface EventDataPrivateMsg extends EventDataApiBase {
  type: MessageScope.PRIVATE;
  messageId: EventDataTargetId;
  message: MessageRaw;
  // messageH?: object /* what is this? */;
  sender: SessionDataSender;
}

interface EventDataGroupMsg extends EventDataApiBase {
  type: MessageScope.GROUP;
  messageId: EventDataTargetId;
  message: MessageRaw;
  sender: SessionDataSender;
  groupId: EventDataTargetId;
}

interface EventDataPrivateRecall extends EventDataApiBase {
  type: MessageScope.PRIVATE;
  messageId: EventDataTargetId;
}

interface EventDataGroupRecall extends EventDataApiBase {
  messageId: EventDataTargetId;
  operatorId: EventDataTargetId;
  groupId: EventDataTargetId;
}

interface EventDataPrivateRequest extends EventDataApiBase {
  type: MessageScope.PRIVATE;
  userId: EventDataTargetId;
}

interface EventDataGroupRequest extends EventDataApiBase {
  type: MessageScope.GROUP;
  userId: EventDataTargetId;
  operatorId: EventDataTargetId;
  groupId: EventDataTargetId;
}

interface EventDataPrivateAdd extends EventDataApiBase {
  userId: EventDataTargetId;
}

interface EventDataGroupIncrease extends EventDataApiBase {
  userId: EventDataTargetId;
  operatorId: EventDataTargetId;
  groupId: EventDataTargetId;
}

interface EventDataGroupDecrease extends EventDataApiBase {
  userId: EventDataTargetId;
  operatorId: EventDataTargetId;
  groupId: EventDataTargetId;
}

interface EventDataGroupAdmin extends EventDataApiBase {
  userId: EventDataTargetId;
  operation: 'set' | 'unset';
  groupId: EventDataTargetId;
}

interface EventDataGroupBan extends EventDataApiBase {
  userId: EventDataTargetId | 0;
  operatorId?: EventDataTargetId;
  time?: number | -1;
  groupId: EventDataTargetId;
}