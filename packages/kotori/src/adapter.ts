import { obj } from '@kotori-bot/tools';
import { langType } from '@kotori-bot/i18n';
import Api from './api';
import Events from './events';
import { MixedBefore } from './content';

interface Istatus {
	value: 'online' | 'offline';
	createTime: Date;
	lastMsgTime: Date | null;
	receivedMsg: number;
	sendMsg: number;
	offlineNum: number;
}

interface IAdapter {
	readonly platform: string;
	readonly selfId: number;
	readonly nickname: string;
	readonly avatar: string;
	// readonly status: Istatus;
	readonly handle: <D extends object>(data: D) => void;
	readonly start: () => void;
	readonly stop: () => void;
}

export interface AdapterConfig extends obj {
	lang: langType;
}

export abstract class Adapter<T extends Api = Api> extends Events implements IAdapter {
	public static get adapterStack() {
		return Object.create(this.AdapterStack);
	}

	public constructor(config: AdapterConfig) {
		super();
		this.config = config;
		if (!Adapter.apiStack[this.platform]) Adapter.apiStack[this.platform] = [];
		this.apis = Adapter.apiStack[this.platform] as T[];
		this.apisIndex = this.apis.length;
	}

	protected readonly apis: T[];

	protected readonly apisIndex: number;

	private readonly Status: Istatus = {
		value: 'offline',
		createTime: new Date(),
		lastMsgTime: null,
		receivedMsg: 0,
		sendMsg: 0,
		offlineNum: 0,
	};

	protected readonly online = () => {
		this.Status.value = 'online';
	};

	protected readonly offline = () => {
		this.Status.value = 'offline';
		this.Status.offlineNum += 1;
	};

	protected readonly locale = (val: string) => MixedBefore.locale(val, this.config.lang);

	public readonly config: AdapterConfig;

	public readonly platform: string = '';

	public readonly selfId: number = -1;

	public readonly nickname: string = '';

	public readonly avatar: string = '';

	public get static() {
		return this.Status;
	}

	public get api() {
		return Object.create(this.Api);
	}

	public set api(value) {
		this.Api = value;
		this.apis[this.apisIndex] = value;
	}

	protected abstract Api: T;

	public abstract readonly handle: (data: any) => void;

	public abstract readonly start: () => void;

	public abstract readonly stop: () => void;
}

export default Adapter;
