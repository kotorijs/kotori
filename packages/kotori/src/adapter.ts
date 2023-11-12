import { none } from '@kotori-bot/tools';
import Api from './api';
import Context from './context';
import Events from './events';
import { AdapterConfig, MessageRaw, MessageScope } from './types';

interface Status {
	value: 'online' | 'offline';
	createTime: Date;
	lastMsgTime: Date | null;
	receivedMsg: number;
	sendMsg: number;
	offlineNum: number;
}

interface AdapterImpl<T extends Api> {
	readonly platform: string;
	readonly selfId: number;
	readonly nickname: string;
	readonly avatar: string;
	readonly config: AdapterConfig;
	readonly identity: string;
	readonly api: T;
	readonly status: Status;
	readonly handle: (data: any) => void;
	readonly start: () => void;
	readonly stop: () => void;
	send: AdapterSend;
}

type AdapterSend = (action: string, params?: object) => void;

const ApiProxy = <T extends Api>(api: T, emit: Events['emit']): T => {
	const apiProxy = Object.create(api);
	const applyCommon = (
		target: (msg: MessageRaw, id: number) => void,
		args: [MessageRaw, number],
		messageType: MessageScope,
	) => {
		const { '0': message, '1': targetId } = args;
		let isCancel = false;
		const cancel = () => {
			isCancel = true;
		};
		emit('before_send', { api, message, messageType, targetId, cancel });
		if (!isCancel) target(message, targetId);
	};
	apiProxy.send_private_msg = new Proxy(api.send_private_msg, {
		apply: (target, _, argArray) => applyCommon(target, argArray as [MessageRaw, number], 'private'),
	});
	apiProxy.send_group_msg = new Proxy(api.send_group_msg, {
		apply: (target, _, argArray) => applyCommon(target, argArray as [MessageRaw, number], 'group'),
	});
	return Object.assign(api, apiProxy);
};

export abstract class Adapter<T extends Api = Api> implements AdapterImpl<T> {
	public constructor(config: AdapterConfig, identity: string, Context: Context, Api: new (adapter: Adapter) => T) {
		this.config = config;
		this.identity = identity;
		this.platform = config.extend;
		this.ctx = Context;
		this.api = ApiProxy(new Api(this), this.ctx.emit);
		if (!this.ctx.apiStack[this.platform]) this.ctx.apiStack[this.platform] = [];
		(this.ctx.apiStack[this.platform] as T[]).push(this.api);
	}

	protected readonly online = () => {
		if (this.status.value !== 'offline') return;
		if (this.status.offlineNum <= 0) {
			this.ctx.emit('ready', { adapter: this });
		}
		this.ctx.emit('online', { adapter: this });
		this.status.value = 'online';
	};

	protected readonly offline = () => {
		if (this.status.value !== 'online') return;
		this.ctx.emit('offline', { adapter: this });
		this.status.value = 'offline';
		this.status.offlineNum += 1;
	};

	protected readonly onSend = () => {
		this.status.sendMsg += 1;
	};

	protected readonly onReceive = () => {
		this.status.receivedMsg += 1;
	};

	protected readonly locale = (val: string) => this.ctx.locale(val, this.config.lang);

	public readonly ctx: Context;

	public readonly config: AdapterConfig;

	public readonly identity: string;

	public readonly platform: string;

	public selfId: number = -1;

	public nickname: string = '';

	public avatar: string = '';

	public readonly api: T;

	public readonly status: Status = {
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

	public send: AdapterSend = action => none(this, action);
}

export default Adapter;
