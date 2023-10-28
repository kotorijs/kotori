import Adapter from './adapter';
import Api from './api';
import { commandAccess } from './command';
import Core from './core';
import { CmdResult, Msg, MsgQuickType, MsgType } from './message';
import { ImoduleStack } from './modules';

interface eventDataBase<T extends keyof IeventList> {
	type: T;
}

export interface eventDataLoadModule extends eventDataBase<'load_module'> {
	module: ImoduleStack | null;
	service: 'database' | 'adapter' | '';
}

export interface eventDataLoadAllModule extends eventDataBase<'load_all_module'> {
	count: number;
}

export interface eventDataUnloadModule extends eventDataBase<'unload_module'> {
	module: ImoduleStack | null;
}

export type eventDataMsgSenderSex = 'male' | 'female' | 'unknown';
export type eventDataOperation = 'set' | 'unset';

export interface eventDataMsgSender {
	nickname: string;
	sex: eventDataMsgSenderSex;
	age: number;
}
export interface eventDataConnect extends eventDataBase<'connect'> {
	normal: boolean;
	adapter: Adapter;
	info: string;
	onlyStart?: boolean;
}

export interface eventDataDisconnect extends eventDataBase<'disconnect'> {
	normal: boolean;
	adapter: Adapter;
	info: string;
}

export interface eventDataReady extends eventDataBase<'ready'> {
	adapter: Adapter;
}

export interface eventDataOnline extends eventDataBase<'online'> {
	adapter: Adapter;
}

export interface eventDataOffline extends eventDataBase<'offline'> {
	adapter: Adapter;
}

type messageData = eventDataGroupMsg | eventDataPrivateMsg<'private_msg'>;
export interface eventDataMidwares extends eventDataBase<'midwares'> {
	isPass: boolean;
	messageData: messageData;
	quick: (message: MsgQuickType) => void;
}

export interface eventDataBeforeCommand extends eventDataBase<'before_command'> {
	messageData: messageData;
	command: string;
	scope: MsgType;
	access: commandAccess;
	cancel: () => void;
}

export interface eventDataCommand extends eventDataBase<'command'> {
	messageData: messageData;
	command: string;
	scope: MsgType;
	access: commandAccess;
	result: CmdResult;
}

export interface eventDataBeforeSend extends eventDataBase<'before_send'> {
	api: Api;
	message: Msg;
	messageType: MsgType;
	targetId: number;
	cancel: () => void;
}

export interface eventDataSend extends eventDataBase<'send'> {
	api: Api;
	/* 	message: Msg;
	messageType: MsgType;
	targetId: number; */
	messageId: number;
}

/* export interface eventDataAdapters extends eventDataBase<'adapters'> {
	adapters: Adapter[];
} */

interface eventDataAdapterBase<T extends keyof IeventList> extends eventDataBase<T> {
	userId: number;
	send: (message: Msg) => void | Promise<unknown>;
	locale: (val: string) => string;
	api: Api;
}

export interface eventDataPrivateMsg<T extends keyof IeventList = 'private_msg'> extends eventDataAdapterBase<T> {
	messageId: number;
	message: Msg;
	messageH?: object /* what is this? */;
	sender: eventDataMsgSender;
	groupId?: number;
}

export interface eventDataGroupMsg extends eventDataPrivateMsg<'group_msg'> {
	groupId: number;
}

interface eventDataPrivateRecall extends eventDataAdapterBase<'private_recall'> {
	messageId: number;
}

interface eventDataGroupRecall extends eventDataAdapterBase<'group_recall'> {
	messageId: number;
	groupId: number;
	operatorId: number;
}

interface eventDataPrivateRequest extends eventDataAdapterBase<'private_request'> {
	userId: number;
}

interface eventDataGroupRequest extends eventDataAdapterBase<'group_request'> {
	userId: number;
	groupId: number;
	operatorId: number;
}

interface eventDataPrivateAdd extends eventDataAdapterBase<'private_add'> {
	userId: number;
}

interface eventDataGroupIncrease extends eventDataAdapterBase<'group_increase'> {
	userId: number;
	groupId: number;
	operatorId: number;
}

interface eventDataGroupDecrease extends eventDataAdapterBase<'group_decrease'> {
	userId: number;
	groupId: number;
	operatorId: number;
}

interface eventDataGroupAdmin extends eventDataAdapterBase<'group_admin'> {
	userId: number;
	groupId: number;
	operation: eventDataOperation;
}

interface eventDataGroupBan extends eventDataAdapterBase<'group_ban'> {
	userId: number | 0;
	operatorId?: number;
	groupId: number;
	time?: number | -1;
}

export interface eventType {
	load_module: eventDataLoadModule;
	load_all_module: eventDataLoadAllModule;
	unload_module: eventDataUnloadModule;
	// adapters: eventDataAdapters;
	connect: eventDataConnect;
	disconnect: eventDataDisconnect;
	ready: eventDataReady;
	online: eventDataOnline;
	offline: eventDataOffline;
	midwares: eventDataMidwares;
	before_command: eventDataBeforeCommand;
	command: eventDataCommand;
	before_send: eventDataBeforeSend;
	send: eventDataSend;
	private_msg: eventDataPrivateMsg;
	group_msg: eventDataGroupMsg;
	private_recall: eventDataPrivateRecall;
	group_recall: eventDataGroupRecall;
	private_request: eventDataPrivateRequest;
	group_request: eventDataGroupRequest;
	private_add: eventDataPrivateAdd;
	group_increase: eventDataGroupIncrease;
	group_decrease: eventDataGroupDecrease;
	group_admin: eventDataGroupAdmin;
	group_ban: eventDataGroupBan;
}

export type eventCallback<T extends keyof eventType> = (data: eventType[T]) => void | Msg;

export interface IeventList {
	load_module: eventCallback<'load_module'>[];
	load_all_module: eventCallback<'load_all_module'>[];
	unload_module: eventCallback<'unload_module'>[];
	connect: eventCallback<'connect'>[];
	disconnect: eventCallback<'disconnect'>[];
	ready: eventCallback<'ready'>[];
	online: eventCallback<'online'>[];
	offline: eventCallback<'offline'>[];
	midwares: eventCallback<'midwares'>[];
	before_command: eventCallback<'before_command'>[];
	command: eventCallback<'command'>[];
	before_send: eventCallback<'before_send'>[];
	send: eventCallback<'send'>[];
	private_msg: eventCallback<'private_msg'>[];
	group_msg: eventCallback<'group_msg'>[];
	private_recall: eventCallback<'private_recall'>[];
	group_recall: eventCallback<'group_recall'>[];
	private_request: eventCallback<'private_request'>[];
	group_request: eventCallback<'group_request'>[];
	private_add: eventCallback<'private_add'>[];
	group_increase: eventCallback<'group_increase'>[];
	group_decrease: eventCallback<'group_decrease'>[];
	group_admin: eventCallback<'group_admin'>[];
	group_ban: eventCallback<'group_ban'>[];
}

export type eventListenerFunc = <T extends keyof eventType>(type: T, callback: eventCallback<T>) => boolean;

export class Events extends Core {
	private static eventStack: IeventList = {
		load_module: [],
		load_all_module: [],
		unload_module: [],
		connect: [],
		disconnect: [],
		ready: [],
		online: [],
		offline: [],
		midwares: [],
		before_command: [],
		command: [],
		before_send: [],
		send: [],
		private_msg: [],
		group_msg: [],
		private_recall: [],
		group_recall: [],
		group_increase: [],
		group_decrease: [],
		group_admin: [],
		group_ban: [],
		private_add: [],
		private_request: [],
		group_request: [],
	};

	protected static readonly addListener: eventListenerFunc = (type, callback) => {
		const eventStack = this.eventStack[type] as unknown[];
		if (eventStack.filter(Element => Element === callback).length > 0) return false;
		eventStack.push(callback);
		return true;
	};

	protected static readonly removeListener: eventListenerFunc = (type, callback) => {
		const eventStack = this.eventStack[type] as unknown[];
		const handleArr = eventStack.filter(Element => Element !== callback);
		if (eventStack.length === handleArr.length) return false;
		(this.eventStack[type] as unknown[]) = handleArr;
		return true;
	};

	protected static readonly removeAllListener: eventListenerFunc = type => {
		const eventStack = this.eventStack[type] as unknown[];
		if (eventStack.length === 0) return false;
		(this.eventStack[type] as unknown[]) = [];
		return true;
	};

	public static readonly emit = <T extends keyof eventType>(eventData: eventType[T]) => {
		this.eventStack[eventData.type].forEach(callback => {
			(callback as eventCallback<T>)(eventData);
		});
	};

	public static readonly on = this.addListener;

	public static readonly once = <T extends keyof eventType>(type: T, callback: eventCallback<T>) => {
		const eventStack = this.eventStack[type] as unknown[];
		const newCallback: eventCallback<T> = data => {
			const index = eventStack.length;
			eventStack.slice(index, index);
			callback(data);
		};
		return this.addListener(type, newCallback);
	};

	public static readonly off = this.removeListener;

	public static readonly offAll = this.removeAllListener;
}

export default Events;
