import { StringTempArgs, obj } from '@kotori-bot/tools';
import { langType } from '@kotori-bot/i18n';
import Api from './api';
import Adapter from './adapter';

export interface BaseDir {
	ROOT: string;
	MODULES: string;
}

export interface GlobalConfigs {
	global: {
		lang: langType;
		'command-prefix': string;
	};
	adapter: {
		[propName: string]: AdapterConfig;
	};
}

export interface GlobalOptions {
	node_env: 'dev' | 'production';
}

export interface AdapterConfig extends obj {
	extend: string;
	master: number;
	lang: langType;
	'command-prefix': string;
}

export type AdapterEntity = new (config: AdapterConfig, identity: string) => Adapter;

export type CommandAccess = 'member' | 'manger' | 'admin';

export type CommandAction = (
	data: { args: CommandArgType[]; options: obj<CommandArgType>; quick: (msg: MessageQuick) => void },
	events: EventType['group_msg' | 'private_msg'],
) => MessageQuick | Promise<MessageQuick>;
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

export type MessageRaw = string;
export type MessageScope = 'private' | 'group';
export type MessageQuick = void | MessageRaw | [string, StringTempArgs];
export const enum CmdResult {
	SUCCESS,
	OPTION_ERROR,
	ARG_ERROR,
	MANY_ARG,
	FEW_ARG,
	SYNTAX,
}

export type ModuleService = 'database' | 'adapter' | 'plugin';

export type ModuleEntityClass = new (...args: unknown[]) => unknown;
export type ModuleEntityFunc = (...args: unknown[]) => unknown;

export interface ModulePackage {
	name: string;
	version: string;
	description: string;
	main: string;
	license: 'GPL-3.0';
	author: string | string[];
	peerDependencies: {
		'kotori-bot': string;
	};
}

export interface ModuleData {
	package: ModulePackage;
	fileList: string[];
	mainPath: string;
}

interface EventDataBase<T extends keyof EventList> {
	type: T;
}

interface EventDataLoadModule extends EventDataBase<'load_module'> {
	module: ModuleData | null;
	service: ModuleService;
}

interface EventDataLoadAllModule extends EventDataBase<'load_all_module'> {
	count: number;
}

interface EventDataUnloadModule extends EventDataBase<'unload_module'> {
	module: ModuleData | null;
}

type EventDataMsgSenderSex = 'male' | 'female' | 'unknown';
type EventDataOperation = 'set' | 'unset';

interface EventDataMsgSender {
	nickname: string;
	sex: EventDataMsgSenderSex;
	age: number;
}
interface EventDataConnect extends EventDataBase<'connect'> {
	normal: boolean;
	adapter: Adapter;
	info: string;
	onlyStart?: boolean;
}

interface EventDataDisconnect extends EventDataBase<'disconnect'> {
	normal: boolean;
	adapter: Adapter;
	info: string;
}

interface EventDataReady extends EventDataBase<'ready'> {
	adapter: Adapter;
}

interface EventDataOnline extends EventDataBase<'online'> {
	adapter: Adapter;
}

interface EventDataOffline extends EventDataBase<'offline'> {
	adapter: Adapter;
}

type messageData = EventDataGroupMsg | EventDataPrivateMsg<'private_msg'>;
interface EventDataMidwares extends EventDataBase<'midwares'> {
	isPass: boolean;
	messageData: messageData;
	quick: (message: MessageQuick) => void;
}

interface EventDataBeforeCommand extends EventDataBase<'before_command'> {
	messageData: messageData;
	command: string;
	scope: MessageScope;
	access: CommandAccess;
	cancel: () => void;
}

interface EventDataCommand extends EventDataBase<'command'> {
	messageData: messageData;
	command: string;
	scope: MessageScope;
	access: CommandAccess;
	result: CmdResult;
}

interface EventDataBeforeSend extends EventDataBase<'before_send'> {
	api: Api;
	message: MessageRaw;
	messageType: MessageScope;
	targetId: number;
	cancel: () => void;
}

interface EventDataSend extends EventDataBase<'send'> {
	api: Api;
	/* 	message: MessageRaw;
	messageType: MessageScope;
	targetId: number; */
	messageId: number;
}

/* interface EventDataAdapters extends EventDataBase<'adapters'> {
	adapters: Adapter[];
} */

interface EventDataAdapterBase<T extends keyof EventList> extends EventDataBase<T> {
	userId: number;
	send: (message: MessageRaw) => void | Promise<unknown>;
	locale: (val: string) => string;
	api: Api;
}

export type EventDataMsg = EventDataPrivateMsg | EventDataGroupMsg;

interface EventDataPrivateMsg<T extends keyof EventList = 'private_msg'> extends EventDataAdapterBase<T> {
	messageId: number;
	message: MessageRaw;
	messageH?: object /* what is this? */;
	sender: EventDataMsgSender;
	groupId?: number;
}

interface EventDataGroupMsg extends EventDataPrivateMsg<'group_msg'> {
	groupId: number;
}

interface EventDataPrivateRecall extends EventDataAdapterBase<'private_recall'> {
	messageId: number;
}

interface EventDataGroupRecall extends EventDataAdapterBase<'group_recall'> {
	messageId: number;
	groupId: number;
	operatorId: number;
}

interface EventDataPrivateRequest extends EventDataAdapterBase<'private_request'> {
	userId: number;
}

interface EventDataGroupRequest extends EventDataAdapterBase<'group_request'> {
	userId: number;
	groupId: number;
	operatorId: number;
}

interface EventDataPrivateAdd extends EventDataAdapterBase<'private_add'> {
	userId: number;
}

interface EventDataGroupIncrease extends EventDataAdapterBase<'group_increase'> {
	userId: number;
	groupId: number;
	operatorId: number;
}

interface EventDataGroupDecrease extends EventDataAdapterBase<'group_decrease'> {
	userId: number;
	groupId: number;
	operatorId: number;
}

interface EventDataGroupAdmin extends EventDataAdapterBase<'group_admin'> {
	userId: number;
	groupId: number;
	operation: EventDataOperation;
}

interface EventDataGroupBan extends EventDataAdapterBase<'group_ban'> {
	userId: number | 0;
	operatorId?: number;
	groupId: number;
	time?: number | -1;
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

export type EventCallback<T extends keyof EventType> = (
	data: EventType[T],
) => void | MessageRaw | Promise<void | MessageRaw>;

export interface EventList {
	load_module: EventCallback<'load_module'>[];
	load_all_module: EventCallback<'load_all_module'>[];
	unload_module: EventCallback<'unload_module'>[];
	connect: EventCallback<'connect'>[];
	disconnect: EventCallback<'disconnect'>[];
	ready: EventCallback<'ready'>[];
	online: EventCallback<'online'>[];
	offline: EventCallback<'offline'>[];
	midwares: EventCallback<'midwares'>[];
	before_command: EventCallback<'before_command'>[];
	command: EventCallback<'command'>[];
	before_send: EventCallback<'before_send'>[];
	send: EventCallback<'send'>[];
	private_msg: EventCallback<'private_msg'>[];
	group_msg: EventCallback<'group_msg'>[];
	private_recall: EventCallback<'private_recall'>[];
	group_recall: EventCallback<'group_recall'>[];
	private_request: EventCallback<'private_request'>[];
	group_request: EventCallback<'group_request'>[];
	private_add: EventCallback<'private_add'>[];
	group_increase: EventCallback<'group_increase'>[];
	group_decrease: EventCallback<'group_decrease'>[];
	group_admin: EventCallback<'group_admin'>[];
	group_ban: EventCallback<'group_ban'>[];
}

export type EventListenerFunc = <T extends keyof EventType>(type: T, callback: EventCallback<T>) => boolean;
