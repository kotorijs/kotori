import { none } from '@kotori-bot/tools';
import Api from './api';
import Content from './content';
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
		emit({ type: 'before_send', api, message, messageType, targetId, cancel });
		if (!isCancel) target(message, targetId);
	};
	apiProxy.send_private_msg = new Proxy(api.send_private_msg, {
		apply: (target, _, argArray) => applyCommon(target, argArray as [MessageRaw, number], 'private'),
	});
	apiProxy.send_group_msg = new Proxy(api.send_group_msg, {
		apply: (target, _, argArray) => applyCommon(target, argArray as [MessageRaw, number], 'group'),
	});
	return apiProxy;
};

export abstract class Adapter<T extends Api = Api> extends Events implements AdapterImpl<T> {
	public constructor(config: AdapterConfig, identity: string, Api: new (adapter: Adapter) => T) {
		super();
		this.config = config;
		this.identity = identity;
		this.apis = this.apiStack[this.platform] as T[];
		this.api = ApiProxy(new Api(this), this.emit);
	}

	protected readonly apis: T[];

	protected readonly online = () => {
		if (this.status.value === 'offline') {
			if (this.status.offlineNum <= 0) {
				this.emit({
					type: 'ready',
					adapter: this,
				});
			}
			this.emit({
				type: 'online',
				adapter: this,
			});
		}
		this.status.value = 'online';
	};

	protected readonly offline = () => {
		if (this.status.value === 'online') {
			this.emit({
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

	protected readonly locale = (val: string) => Content.locale(val, this.config.lang);

	public readonly config: AdapterConfig;

	public readonly identity: string;

	public readonly platform: string = '';

	public readonly selfId: number = -1;

	public readonly nickname: string = '';

	public readonly avatar: string = '';

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
