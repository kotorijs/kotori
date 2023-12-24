import type { StringTempArgs, obj } from '@kotori-bot/tools';
import Tsu from 'tsukiko';
import { LocaleType } from '@kotori-bot/i18n';
import type Api from './components/api';
import type Adapter from './components/adapter';
import type Context from './context';
import { defaultConfig } from './core/core';
import type Elements from './components/elements';
import { DEFAULT_COMMAND_PREFIX, DEFAULT_ENV, DEFAULT_LANG, DEFAULT_MODULES_DIR, DEFAULT_ROOT_DIR } from './consts';

export const baseDirSchema = Tsu.Object({
  root: Tsu.String(),
  modules: Tsu.String(),
});

export type BaseDir = Tsu.infer<typeof baseDirSchema>;

export const packageInfoSchema = Tsu.Object({
  name: Tsu.String(),
  version: Tsu.String(),
  description: Tsu.String(),
  main: Tsu.String(),
  license: Tsu.Literal('GPL-3.0'),
  author: Tsu.String(),
});

export type PackageInfo = Tsu.infer<typeof packageInfoSchema>;

export const localeTypeSchema = Tsu.Union([
  Tsu.Union([Tsu.Literal('en_US'), Tsu.Literal('ja_JP')]),
  Tsu.Union([Tsu.Literal('zh_CN'), Tsu.Literal('zh_TW')]),
]);

export const globalOptions = Tsu.Object({
  env: Tsu.Union([Tsu.Literal('dev'), Tsu.Literal('build')]).default('dev'),
});

export type GlobalOptions = Tsu.infer<typeof globalOptions>;

const CommonConfigSchemaController = (lang = DEFAULT_LANG, commandPrefix = DEFAULT_COMMAND_PREFIX) =>
  Tsu.Object({
    lang: localeTypeSchema.default(lang),
    'command-prefix': Tsu.String().default(commandPrefix),
  });

const GlobalConfigSchema = Tsu.Intersection([
  Tsu.Object({
    dirs: Tsu.Array(Tsu.String()).default([]),
  }),
  CommonConfigSchemaController(),
]);

const adapterConfigBaseSchemaController = (lang?: LocaleType, commandPrefix?: string) =>
  Tsu.Intersection([
    Tsu.Object({
      extends: Tsu.String(),
      master: Tsu.Union([Tsu.Number(), Tsu.String()]),
    }),
    CommonConfigSchemaController(lang, commandPrefix),
  ]);

const adapterConfigBaseSchema = adapterConfigBaseSchemaController();

const pluginConfigBaseSchema = Tsu.Object({
  priority: Tsu.Number().min(0).default(100),
});

export const globalConfigSchemaController = (lang?: LocaleType, commandPrefix?: string) =>
  Tsu.Object({
    global: GlobalConfigSchema,
    adapter: Tsu.Object({}).index(adapterConfigBaseSchemaController(lang, commandPrefix)).default({}),
    plugin: Tsu.Object({}).index(pluginConfigBaseSchema),
  });

const globalConfigSchema = globalConfigSchemaController();

export type GlobalConfig = Tsu.infer<typeof globalConfigSchema>;

export type AdapterConfig = Tsu.infer<typeof adapterConfigBaseSchema>;

export type AdapterConstructor = new (ctx: Context, config: AdapterConfig, identity: string) => Adapter;
export type ApiConstructor<T extends Api> = new (adapter: Adapter, el: Elements) => T;

export type ElementsParam = {
  [K in Exclude<keyof Elements, 'supports'>]?: (...args: unknown[]) => string;
};

export const kotoriConfigSchema = Tsu.Object({
  baseDir: baseDirSchema.default({ root: DEFAULT_ROOT_DIR, modules: DEFAULT_MODULES_DIR }),
  config: globalConfigSchema.default({
    global: {
      lang: DEFAULT_LANG,
      'command-prefix': DEFAULT_COMMAND_PREFIX,
    },
    adapter: {},
  } as Tsu.infer<typeof globalConfigSchema>),
  options: globalOptions.default({
    env: DEFAULT_ENV,
  } as Tsu.infer<typeof globalOptions>), // question
}).default(defaultConfig as any);

export type KotoriConfig = Tsu.infer<typeof kotoriConfigSchema>;

export interface ApiExtra {
  default: { type: 'default' };
}

/* export type ApiExtraValue = (ApiExtra & { any: { type: Exclude<string, keyof ApiExtra> } & Omit<obj, 'type'> })[
	| keyof ApiExtra
	| 'any']; */

export const enum CommandAccess {
  MEMBER,
  MANGER,
  ADMIN,
}

export type CommandAction = (
  data: { args: CommandArgType[]; options: obj<CommandArgType> },
  session: EventType['group_msg' | 'private_msg'],
) =>
  | MessageQuick
  | CommandResultExtra[keyof CommandResultExtra]
  | void
  | Promise<MessageQuick | CommandResultExtra[keyof CommandResultExtra] | void>;
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

export type ModuleType = 'database' | 'adapter' | 'plugin';
export type ModuleInstanceType = 'constructor' | 'function' | 'none';

export type ModuleInstanceConstructor = new (ctx: Context, config: object) => unknown;
export type ModuleInstanceFunction = (ctx: Context, config: object) => unknown;

/* here need feat */
export type MidwareCallback = (next: () => void, session: EventDataMsg) => MessageQuick /* ReturnType<CommandAction> */;
export type RegexpCallback = (
  match: RegExpMatchArray,
  session: EventDataMsg,
) => MessageQuick /* ReturnType<CommandAction> */;

export interface MidwareStack {
  extend: string;
  callback: MidwareCallback;
  priority: number;
}

export interface CommandStack {
  extend: string;
  data: CommandData;
}

export interface RegexpStack {
  extend: string;
  match: RegExp;
  callback: RegexpCallback;
}

export const ModulePackageSchema = Tsu.Object({
  name: Tsu.String().regexp(/kotori-plugin-[a-z]([a-z,0-9]{3,13})\b/),
  version: Tsu.String(),
  description: Tsu.String(),
  main: Tsu.String(),
  license: Tsu.Literal('GPL-3.0'),
  author: Tsu.Union([Tsu.String(), Tsu.Array(Tsu.String())]),
  peerDependencies: Tsu.Object({
    'kotori-bot': Tsu.String(),
  }),
});

export type ModulePackage = Tsu.infer<typeof ModulePackageSchema>;

export interface ModuleData {
  package: ModulePackage;
  fileList: string[];
  mainPath: string;
}

export interface EventDataBase<T extends keyof EventType> {
  type: T;
}

interface EventDataLoadModule extends EventDataBase<'load_module'> {
  module: ModuleData | null;
  moduleType: ModuleType;
  instanceType: ModuleInstanceType;
}

interface EventDataLoadAllModule extends EventDataBase<'load_all_module'> {
  reality: number;
  expected: number;
}

interface EventDataUnloadModule extends EventDataBase<'unload_module'> {
  module: ModuleData | null;
}

type EventDataMsgSenderSex = 'male' | 'female' | 'unknown';
type EventDataOperation = 'set' | 'unset';

export interface EventDataMsgSender {
  nickname: string;
  sex: EventDataMsgSenderSex;
  age: number;
}

export interface EventDataAdapterBase<T extends keyof EventType> extends EventDataBase<T> {
  adapter: Adapter;
}

interface EventDataConnect extends EventDataAdapterBase<'connect'> {
  normal: boolean;
  info: string;
  onlyStart?: boolean;
}

interface EventDataDisconnect extends EventDataAdapterBase<'disconnect'> {
  normal: boolean;
  info: string;
}

interface EventDataReady extends EventDataAdapterBase<'ready'> {}

interface EventDataOnline extends EventDataAdapterBase<'online'> {}

interface EventDataOffline extends EventDataAdapterBase<'offline'> {}

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
  result: CommandParseResultExtra[keyof CommandParseResultExtra];
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
  result: CommandResultExtra[keyof CommandResultExtra];
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

/* interface EventDataAdapters extends EventDataBase<'adapters'> {
	adapters: Adapter[];
} */

export interface EventDataApiBase<T extends keyof EventType, M extends MessageScope = MessageScope>
  extends EventDataBase<T> {
  api: Api;
  el: Elements;
  userId: EventDataTargetId;
  messageType: M;
  send(message: MessageRaw): void;
  locale(val: string): string;
  quick(message: MessageQuick): void;
  error<T extends keyof CommandResult>(type: T, data?: Omit<CommandResultExtra[T], 'type'>): CommandResultExtra[T];
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

export interface EventType {
  load_module: EventDataLoadModule;
  load_all_module: EventDataLoadAllModule;
  unload_module: EventDataUnloadModule;
  // adapters: EventDataAdapters;
  connect: EventDataConnect;
  disconnect: EventDataDisconnect;
  ready: EventDataReady;
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
/* 
export type EventType = { [P in keyof EventAfterType]: EventAfterType[P]} & { 
    [P in `before_${keyof EventBeforeType}`]: EventBeforeType[T extends `before_${infer R}` ? R : T];
} */

export type EventCallback<T extends keyof EventType> = (data: EventType[T]) => void;

export type EventLists = { type: keyof EventType; callback: EventCallback<keyof EventType> }[];

export interface DevErrorExtra {
  path: string;
  type: 'warning' | 'info' | 'error';
}
