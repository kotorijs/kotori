import Tsu from 'tsukiko';
import I18n from '@kotori-bot/i18n';
import type { CommandAccess, CommandAction, MessageQuick, MessageRaw, MessageScope } from './message';
import type { Adapter, Api, Elements, Service } from '../components';
import type { EventDataBase, EventsList } from './context';
import CommandError from '../utils/commandError';

/* interface EventDataReadyAll extends EventDataBase<'ready_all'> {
  reality: number;
  expected: number;
} */

type EventDataMsgSenderSex = 'male' | 'female' | 'unknown';
type EventDataOperation = 'set' | 'unset';

export interface EventDataMsgSender {
  nickname: string;
  sex: EventDataMsgSenderSex;
  age: number;
}

export interface EventDataServiceBase<T extends keyof EventsList> extends EventDataBase<T> {
  service: Service; // fix question
}

interface EventDataConnect extends EventDataServiceBase<'connect'> {
  normal: boolean;
  info: string;
  onlyStart?: boolean;
}

interface EventDataDisconnect extends EventDataServiceBase<'disconnect'> {
  normal: boolean;
  info: string;
}

interface EventDataOnline extends EventDataBase<'online'> {
  adapter: Adapter;
}

interface EventDataOffline extends EventDataBase<'offline'> {
  adapter: Adapter;
}

export type EventDataMsg = EventDataPrivateMsg | EventDataGroupMsg;

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
  result: EventDataParse['result'];
}

export const eventDataTargetIdSchema = Tsu.Union([Tsu.String(), Tsu.Number()]);

export type EventDataTargetId = Tsu.infer<typeof eventDataTargetIdSchema>;

interface EventDataBeforeSend extends EventDataBase<'before_send'> {
  api: Api;
  message: MessageRaw;
  messageType: MessageScope;
  targetId: EventDataTargetId;
  cancel(): void;
}

interface EventDataSend extends EventDataBase<'send'> {
  api: Api;
  /* 	message: MessageRaw;
  messageType: MessageScope;
  targetId: EventDataTargetId; */
  messageId: EventDataTargetId;
}

export interface EventDataApiBase<T extends keyof EventsList, M extends MessageScope = MessageScope>
  extends EventDataBase<T> {
  api: Api;
  el: Elements;
  userId: EventDataTargetId;
  messageType: M;
  i18n: I18n;
  send(message: MessageRaw): void;
  quick(message: MessageQuick): void;
  extra?: unknown;
}

interface EventDataPrivateMsg extends EventDataApiBase<'private_msg', 'private'> {
  messageId: EventDataTargetId;
  message: MessageRaw;
  // messageH?: object /* what is this? */;
  sender: EventDataMsgSender;
  groupId?: EventDataTargetId;
}

interface EventDataGroupMsg extends EventDataApiBase<'group_msg', 'group'> {
  messageId: EventDataTargetId;
  message: MessageRaw;
  sender: EventDataMsgSender;
  groupId: EventDataTargetId;
}

interface EventDataPrivateRecall extends EventDataApiBase<'private_recall', 'private'> {
  messageId: EventDataTargetId;
}

interface EventDataGroupRecall extends EventDataApiBase<'group_recall', 'group'> {
  messageId: EventDataTargetId;
  operatorId: EventDataTargetId;
  groupId: EventDataTargetId;
}

interface EventDataPrivateRequest extends EventDataApiBase<'private_request', 'private'> {
  userId: EventDataTargetId;
}

interface EventDataGroupRequest extends EventDataApiBase<'group_request', 'group'> {
  userId: EventDataTargetId;
  operatorId: EventDataTargetId;
  groupId: EventDataTargetId;
}

interface EventDataPrivateAdd extends EventDataApiBase<'private_add', 'private'> {
  userId: EventDataTargetId;
}

interface EventDataGroupIncrease extends EventDataApiBase<'group_increase', 'group'> {
  userId: EventDataTargetId;
  operatorId: EventDataTargetId;
  groupId: EventDataTargetId;
}

interface EventDataGroupDecrease extends EventDataApiBase<'group_decrease', 'group'> {
  userId: EventDataTargetId;
  operatorId: EventDataTargetId;
  groupId: EventDataTargetId;
}

interface EventDataGroupAdmin extends EventDataApiBase<'group_admin', 'group'> {
  userId: EventDataTargetId;
  operation: EventDataOperation;
  groupId: EventDataTargetId;
}

interface EventDataGroupBan extends EventDataApiBase<'group_ban', 'group'> {
  userId: EventDataTargetId | 0;
  operatorId?: EventDataTargetId;
  time?: number | -1;
  groupId: EventDataTargetId;
}

declare module './context' {
  interface EventsList {
    connect: EventDataConnect;
    disconnect: EventDataDisconnect;
    online: EventDataOnline;
    offline: EventDataOffline;
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
