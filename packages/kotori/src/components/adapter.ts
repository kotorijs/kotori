import { stringTemp } from '@kotori-bot/tools';
import type Api from './api';
import type Context from '../context';
import type Events from '../core/events';
import type {
	EventDataApiBase,
	MessageQuickFunc,
	AdapterConfig,
	EventType,
	MessageRaw,
	MessageScope,
	EventDataTargetId,
	CommandResult,
	CommandResultExtra,
} from '../types';
import Service from './service';

interface Status {
	value: 'online' | 'offline';
	createTime: Date;
	lastMsgTime: Date | null;
	receivedMsg: number;
	sentMsg: number;
	offlineTimes: number;
}

interface AdapterImpl<T extends Api> {
	readonly platform: string;
	readonly selfId: EventDataTargetId;
	readonly identity: string;
	readonly api: T;
	readonly status: Status;
}

// type AdapterSend = (...args: any[]) => void;

function ApiProxy<T extends Api>(api: T, emit: Events['emit']): T {
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
	return apiProxy;
}

type EventApiType = {
	[K in Extract<EventType[keyof EventType], EventDataApiBase<keyof EventType>>['type']]: EventType[K];
};

export abstract class Adapter<T extends Api = Api> extends Service implements AdapterImpl<T> {
	public constructor(
		ctx: Context,
		config: AdapterConfig,
		identity: string,
		ApiConstructor: new (adapter: Adapter) => T,
	) {
		super();
		this.config = config;
		this.identity = identity;
		this.platform = config.extend;
		this.ctx = ctx;
		this.api = ApiProxy(new ApiConstructor(this), this.ctx.emit);
		if (!this.ctx.internal.getBots(this.platform)) this.ctx.internal.setBots(this.platform, []);
		(this.ctx.internal.getBots(this.platform) as Api[]).push(this.api);
	}

	public abstract send(action: string, params?: object): void | object | Promise<unknown> | null | undefined;

	protected online() {
		if (this.status.value !== 'offline') return;
		if (this.status.offlineTimes <= 0) {
			this.ctx.emit('ready', { adapter: this });
		}
		this.ctx.emit('online', { adapter: this });
		this.status.value = 'online';
	}

	protected offline() {
		if (this.status.value !== 'online') return;
		this.ctx.emit('offline', { adapter: this });
		this.status.value = 'offline';
		this.status.offlineTimes += 1;
	}

	protected emit<N extends keyof EventApiType>(
		type: N,
		data: Omit<EventApiType[N], 'type' | 'api' | 'send' | 'locale' | 'quick' | 'error'>,
	) {
		const send = (message: MessageRaw) => {
			if (type === 'group_msg') {
				this.api.send_group_msg(message, (data as unknown as EventType['group_msg']).groupId);
			} else {
				this.api.send_private_msg(message, data.userId);
			}
		};
		const locale = (val: string) => this.ctx.locale(val, this.config.lang);
		const quick: MessageQuickFunc = async message => {
			const msg = await message;
			if (!msg) return;
			if (typeof msg === 'string') {
				send(locale(msg));
				return;
			}
			const params = msg[1];
			Object.keys(params).forEach(key => {
				if (typeof params[key] !== 'string') return;
				params[key] = locale(params[key] as string);
			});
			send(stringTemp(locale(msg[0]), params));
		};
		const error = <T extends keyof CommandResult>(
			type: T,
			data?: Omit<CommandResultExtra[T], 'type'>,
		): CommandResultExtra[T] =>
			({
				type,
				...data,
			}) as CommandResultExtra[T];
		this.ctx.emit(type, { ...data, api: this.api, send, locale, quick, error } as unknown as EventType[N]);
	}

	public readonly ctx: Context;

	public readonly config: AdapterConfig;

	public readonly identity: string;

	public readonly platform: string;

	public readonly api: T;

	public readonly status: Status = {
		value: 'offline',
		createTime: new Date(),
		lastMsgTime: null,
		receivedMsg: 0,
		sentMsg: 0,
		offlineTimes: 0,
	};

	public selfId: EventDataTargetId = -1;
}

export default Adapter;
