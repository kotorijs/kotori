import { none, obj } from '@kotori-bot/tools';
import { langType } from '@kotori-bot/i18n';
import Api from './api';
import Events from './events';
import Mixed from './mixed';

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
	extend: string;
	master: number;
	lang: langType;
}

export type sendFunc = (action: string, params?: object) => void;
export type AdapterType = new (config: AdapterConfig, identity: string) => Adapter;

export abstract class Adapter<T extends Api = Api> extends Events implements IAdapter {
	public static get adapterStack() {
		return Object.create(this.AdapterStack);
	}

	public constructor(config: AdapterConfig, identity: string) {
		super();
		this.config = config;
		this.identity = identity;
		this.apis = Adapter.apiStack[this.platform] as T[];
	}

	protected readonly apis: T[];

	// protected readonly apisIndex: number;

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

	protected readonly locale = (val: string) => Mixed.locale(val, this.config.lang);

	public readonly config: AdapterConfig;

	public readonly identity: string;

	public readonly platform: string = '';

	public readonly selfId: number = -1;

	public readonly nickname: string = '';

	public readonly avatar: string = '';

	public get status() {
		return this.Status;
	}

	/* 	public get api() {
		return Object.create(this.Api);
	} */
	/* 
	public set api(value) {
		this.Api = value;
		this.apis[this.apisIndex] = value;
	} */

	public abstract api: T;

	public abstract readonly handle: (data: any) => void;

	public abstract readonly start: () => void;

	public abstract readonly stop: () => void;

	public send: sendFunc = action => none(this, action);
}

export default Adapter;
