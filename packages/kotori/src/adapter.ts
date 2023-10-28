import { none, obj } from '@kotori-bot/tools';
import { langType } from '@kotori-bot/i18n';
import Api from './api';
import Mixed from './mixed';
import Core from './core';
import Events from './events';
import { Msg, MsgType } from './message';

interface Istatus {
	value: 'online' | 'offline';
	createTime: Date;
	lastMsgTime: Date | null;
	receivedMsg: number;
	sendMsg: number;
	offlineNum: number;
}

interface IAdapter<T extends Api> {
	readonly platform: string;
	readonly selfId: number;
	readonly nickname: string;
	readonly avatar: string;
	readonly config: AdapterConfig;
	readonly identity: string;
	readonly api: T;
	readonly status: Istatus;
	readonly handle: (data: any) => void;
	readonly start: () => void;
	readonly stop: () => void;
	send: sendFunc;
}

export interface AdapterConfig extends obj {
	extend: string;
	master: number;
	lang: langType;
	'command-prefix': string;
}

export type sendFunc = (action: string, params?: object) => void;
export type AdapterType = new (config: AdapterConfig, identity: string) => Adapter;

const ApiProxy = <T extends Api>(api: T): T => {
	const apiProxy = Object.create(api);
	const applyCommon = (target: (msg: Msg, id: number) => void, args: [Msg, number], messageType: MsgType) => {
		const { '0': message, '1': targetId } = args;
		let isCancel = false;
		const cancel = () => {
			isCancel = true;
		};
		Events.emit({ type: 'before_send', api, message, messageType, targetId, cancel });
		if (!isCancel) target(message, targetId);
	};
	apiProxy.send_private_msg = new Proxy(api.send_private_msg, {
		apply: (target, _, argArray) => applyCommon(target, argArray as [Msg, number], 'private'),
	});
	apiProxy.send_group_msg = new Proxy(api.send_group_msg, {
		apply: (target, _, argArray) => applyCommon(target, argArray as [Msg, number], 'group'),
	});
	return apiProxy;
};

export abstract class Adapter<T extends Api = Api> extends Core implements IAdapter<T> {
	public constructor(config: AdapterConfig, identity: string, Api: new (adapter: Adapter) => T) {
		super();
		this.config = config;
		this.identity = identity;
		this.apis = Core.apiStack[this.platform] as T[];
		this.api = ApiProxy(new Api(this));
	}

	protected readonly apis: T[];

	protected readonly online = () => {
		if (this.status.value === 'offline') {
			if (this.status.offlineNum <= 0) {
				Events.emit({
					type: 'ready',
					adapter: this,
				});
			}
			Events.emit({
				type: 'online',
				adapter: this,
			});
		}
		this.status.value = 'online';
	};

	protected readonly offline = () => {
		if (this.status.value === 'online') {
			Events.emit({
				adapter: this,
				type: 'offline',
			});
		}
		this.status.value = 'offline';
		this.status.offlineNum += 1;
	};

	protected readonly onSend = () => {
		this.status.sendMsg += 1;
	};

	protected readonly onReceive = () => {
		this.status.receivedMsg += 1;
	};

	protected readonly locale = (val: string) => Mixed.locale(val, this.config.lang);

	public readonly config: AdapterConfig;

	public readonly identity: string;

	public readonly platform: string = '';

	public readonly selfId: number = -1;

	public readonly nickname: string = '';

	public readonly avatar: string = '';

	public readonly api: T;

	public readonly status: Istatus = {
		value: 'offline',
		createTime: new Date(),
		lastMsgTime: null,
		receivedMsg: 0,
		sendMsg: 0,
		offlineNum: 0,
	};

	public abstract readonly handle: (data: any) => void;

	public abstract readonly start: () => void;

	public abstract readonly stop: () => void;

	public send: sendFunc = action => none(this, action);
}

export default Adapter;
