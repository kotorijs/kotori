/*
 * @Author: Hotaru biyuehuya@gmail.com
 * @Blog: https://hotaru.icu
 * @Date: 2023-09-29 14:31:09
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2023-10-28 16:35:45
 */
import Kotori, { Adapter, AdapterConfig, Msg, isObj } from 'kotori-bot';
import WebSocket from 'ws';
import QQApi from './api';
import WsServer from './services/wsserver';
import { EventDataType, Iconfig, IconfigWs } from './type';

function checkConfig(config: unknown): config is Iconfig {
	if (!isObj(config)) return false;
	if (typeof config.port !== 'number') return false;
	if (config.mode === 'ws') {
		return typeof config.retry === 'number' && typeof config.address === 'string';
	}
	if (config.mode === 'ws-reverse') {
		return true;
	}
	return false;
}

export default class QQAdapter extends Adapter<QQApi> {
	private info: string;

	public readonly platform: string = 'qq';

	public declare config: Iconfig;

	public constructor(config: AdapterConfig, identity: string) {
		super(config, identity, QQApi);
		if (!checkConfig(config)) throw new Error(`Bot '${identity}' config format error`);
		this.config = config;
		this.info = `${this.config.address}:${this.config.port}`;
	}

	public handle = (data: EventDataType) => {
		if (data.post_type === 'message' && data.message_type === 'private') {
			Kotori.emit({
				type: 'private_msg',
				userId: data.user_id,
				messageId: data.message_id,
				message: data.message,
				sender: {
					nickname: data.sender.nickname,
					age: data.sender.age,
					sex: data.sender.sex,
				},
				groupId: data.group_id,
				...this.funcs(data),
			});
		} else if (data.post_type === 'message' && data.message_type === 'group') {
			Kotori.emit({
				type: 'group_msg',
				userId: data.user_id,
				messageId: data.message_id,
				message: data.message,
				sender: {
					nickname: data.sender.nickname,
					age: data.sender.age,
					sex: data.sender.sex,
				},
				groupId: data.group_id!,
				...this.funcs(data),
			});
		} else if (data.post_type === 'notice' && data.notice_type === 'private_recall') {
			Kotori.emit({
				type: 'private_recall',
				userId: data.user_id,
				messageId: data.message_id,
				...this.funcs(data),
			});
		} else if (data.post_type === 'notice' && data.notice_type === 'group_recall') {
			Kotori.emit({
				type: 'group_recall',
				userId: data.user_id,
				messageId: data.message_id,
				groupId: data.group_id!,
				operatorId: data.operator_id || data.user_id,
				...this.funcs(data),
			});
		} else if (data.post_type === 'request' && data.request_type === 'private') {
			Kotori.emit({
				type: 'private_request',
				userId: data.user_id,
				...this.funcs(data),
			});
		} else if (data.post_type === 'request' && data.request_type === 'group') {
			Kotori.emit({
				type: 'group_request',
				userId: data.user_id,
				groupId: data.group_id!,
				operatorId: data.operator_id || data.user_id,
				...this.funcs(data),
			});
		} else if (data.post_type === 'notice' && data.notice_type === 'private_add') {
			Kotori.emit({
				type: 'private_add',
				userId: data.user_id,
				...this.funcs(data),
			});
		} else if (data.post_type === 'notice' && data.notice_type === 'group_increase') {
			Kotori.emit({
				type: 'group_increase',
				userId: data.user_id,
				groupId: data.group_id!,
				operatorId: data.operator_id || data.user_id,
				...this.funcs(data),
			});
		} else if (data.post_type === 'notice' && data.notice_type === 'group_decrease') {
			Kotori.emit({
				type: 'group_decrease',
				userId: data.user_id,
				groupId: data.group_id!,
				operatorId: data.operator_id || data.user_id,
				...this.funcs(data),
			});
		} else if (data.post_type === 'notice' && data.notice_type === 'group_admin') {
			Kotori.emit({
				type: 'group_admin',
				userId: data.user_id,
				groupId: data.group_id!,
				operation: data.sub_type === 'set' ? 'set' : 'unset',
				...this.funcs(data),
			});
		} else if (data.post_type === 'notice' && data.notice_type === 'group_ban') {
			Kotori.emit({
				type: 'group_ban',
				userId: data.user_id,
				groupId: data.group_id!,
				operatorId: data.operator_id,
				time: data.duration!,
				...this.funcs(data),
			});
		} else if (data.post_type === 'meta_event' && data.meta_event_type === 'heartbeat') {
			if (data.status.online) {
				this.online();
				if (this.onlineTimerId) clearTimeout(this.onlineTimerId);
			}
		} else if (data.data instanceof Object && data.data.message_id && typeof data.data.message_id === 'number') {
			Kotori.emit({
				type: 'send',
				api: this.api,
				messageId: data.data.message_id,
			});
		}
		if (!this.onlineTimerId) this.onlineTimerId = setTimeout(() => this.offline, 50 * 1000);
	};

	private funcs = (data: EventDataType) => {
		const send = (message: Msg) => {
			if (data.message_type === 'group') {
				this.api.send_group_msg(message, data.group_id!);
			} else {
				this.api.send_private_msg(message, data.user_id);
			}
		};
		return { send, api: this.api, locale: this.locale };
	};

	public start = () => {
		if (this.config.mode === 'ws-reverse') {
			Kotori.emit({
				type: 'connect',
				adapter: this,
				normal: true,
				info: `start wsserver at ${this.info}`,
				onlyStart: true,
			});
		}
		this.connectWss();
	};

	public stop = () => {
		Kotori.emit({
			type: 'disconnect',
			adapter: this,
			normal: true,
			info: this.config.mode === 'ws' ? `disconnect from ${this.info}` : `stop wsserver at ${this.info}`,
		});
		this.socket?.close();
		this.offline();
	};

	private socket: WebSocket | null = null;

	private connectWss = async () => {
		if (this.config.mode === 'ws-reverse') {
			this.socket = await WsServer(this.config.port);
			Kotori.emit({
				type: 'connect',
				adapter: this,
				normal: true,
				info: `client connect to ${this.info}`,
			});
			this.socket.on('close', () => {
				Kotori.emit({
					type: 'disconnect',
					adapter: this,
					normal: false,
					info: `unexpected client disconnect from ${this.info}`,
				});
			});
		} else {
			Kotori.emit({
				type: 'connect',
				adapter: this,
				normal: true,
				info: `connect server to ${this.info}`,
			});
			this.socket = new WebSocket(`${this.info}`);
			this.socket.on('close', () => {
				Kotori.emit({
					type: 'disconnect',
					adapter: this,
					normal: false,
					info: `unexpected disconnect server from ${this.info}, will reconnect in ${this.config.retry} seconds`,
				});
				setTimeout(
					() => {
						if (!this.socket) return;
						this.socket.close();
						Kotori.emit({
							type: 'connect',
							adapter: this,
							normal: false,
							info: `reconnect server to ${this.info}`,
						});
						this.connectWss();
					},
					(this.config as IconfigWs).retry * 1000,
				);
			});
		}
		this.socket.on('message', data => this.handle(JSON.parse(data.toString())));

		this.send = (action, param?) => {
			this.socket?.send(JSON.stringify({ action, ...param }));
		};
	};

	private onlineTimerId: NodeJS.Timeout | null = null;
}
