/*
 * @Author: Hotaru biyuehuya@gmail.com
 * @Blog: https://hotaru.icu
 * @Date: 2023-09-29 14:31:09
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2023-11-12 16:30:28
 */
import { Adapter, AdapterConfig, Context, MessageRaw, isObj } from 'kotori-bot';
import WebSocket from 'ws';
import QQApi from './api';
import WsServer from './services/wsserver';
import { EventDataType, QQConfig, QQConfigWs } from './types';

function checkConfig(config: unknown): config is QQConfig {
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
	private readonly info: string;

	public readonly config: QQConfig;

	public constructor(config: AdapterConfig, identity: string, ctx: Context) {
		super(config, identity, ctx, QQApi);
		if (!checkConfig(config)) throw new Error(`Bot '${identity}' config format error`);
		this.config = config;
		this.info = `${this.config.address}:${this.config.port}`;
	}

	public handle = (data: EventDataType) => {
		if (data.post_type === 'message' && data.message_type === 'private') {
			this.ctx.emit('private_msg', {
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
			this.ctx.emit('group_msg', {
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
			this.ctx.emit('private_recall', {
				userId: data.user_id,
				messageId: data.message_id,
				...this.funcs(data),
			});
		} else if (data.post_type === 'notice' && data.notice_type === 'group_recall') {
			this.ctx.emit('group_recall', {
				userId: data.user_id,
				messageId: data.message_id,
				groupId: data.group_id!,
				operatorId: data.operator_id || data.user_id,
				...this.funcs(data),
			});
		} else if (data.post_type === 'request' && data.request_type === 'private') {
			this.ctx.emit('private_request', {
				userId: data.user_id,
				...this.funcs(data),
			});
		} else if (data.post_type === 'request' && data.request_type === 'group') {
			this.ctx.emit('group_request', {
				userId: data.user_id,
				groupId: data.group_id!,
				operatorId: data.operator_id || data.user_id,
				...this.funcs(data),
			});
		} else if (data.post_type === 'notice' && data.notice_type === 'private_add') {
			this.ctx.emit('private_add', {
				userId: data.user_id,
				...this.funcs(data),
			});
		} else if (data.post_type === 'notice' && data.notice_type === 'group_increase') {
			this.ctx.emit('group_increase', {
				userId: data.user_id,
				groupId: data.group_id!,
				operatorId: data.operator_id || data.user_id,
				...this.funcs(data),
			});
		} else if (data.post_type === 'notice' && data.notice_type === 'group_decrease') {
			this.ctx.emit('group_decrease', {
				userId: data.user_id,
				groupId: data.group_id!,
				operatorId: data.operator_id || data.user_id,
				...this.funcs(data),
			});
		} else if (data.post_type === 'notice' && data.notice_type === 'group_admin') {
			this.ctx.emit('group_admin', {
				userId: data.user_id,
				groupId: data.group_id!,
				operation: data.sub_type === 'set' ? 'set' : 'unset',
				...this.funcs(data),
			});
		} else if (data.post_type === 'notice' && data.notice_type === 'group_ban') {
			this.ctx.emit('group_ban', {
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
			if (this.selfId === -1 && typeof data.self_id === 'number') {
				this.selfId = data.self_id;
				this.avatar = `https://q.qlogo.cn/g?b=qq&s=640&nk=${this.selfId}`;
			}
		} else if (data.data instanceof Object && data.data.message_id && typeof data.data.message_id === 'number') {
			this.ctx.emit('send', {
				api: this.api,
				messageId: data.data.message_id,
			});
		}
		if (!this.onlineTimerId) this.onlineTimerId = setTimeout(() => this.offline, 50 * 1000);
	};

	private funcs = (data: EventDataType) => {
		const send = (message: MessageRaw) => {
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
			this.ctx.emit('connect', {
				adapter: this,
				normal: true,
				info: `start wsserver at ${this.info}`,
				onlyStart: true,
			});
		}
		this.connectWss();
	};

	public stop = () => {
		this.ctx.emit('disconnect', {
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
			this.ctx.emit('connect', {
				adapter: this,
				normal: true,
				info: `client connect to ${this.info}`,
			});
			this.socket.on('close', () => {
				this.ctx.emit('disconnect', {
					adapter: this,
					normal: false,
					info: `unexpected client disconnect from ${this.info}`,
				});
			});
		} else {
			this.ctx.emit('connect', {
				adapter: this,
				normal: true,
				info: `connect server to ${this.info}`,
			});
			this.socket = new WebSocket(`${this.info}`);
			this.socket.on('close', () => {
				this.ctx.emit('disconnect', {
					adapter: this,
					normal: false,
					info: `unexpected disconnect server from ${this.info}, will reconnect in ${
						(this.config as QQConfigWs).retry
					} seconds`,
				});
				setTimeout(
					() => {
						if (!this.socket) return;
						this.socket.close();
						this.ctx.emit('connect', {
							adapter: this,
							normal: false,
							info: `reconnect server to ${this.info}`,
						});
						this.connectWss();
					},
					(this.config as QQConfigWs).retry * 1000,
				);
			});
		}
		this.socket.on('message', data => this.handle(JSON.parse(data.toString())));

		this.send = (action, params?) => {
			this.socket?.send(JSON.stringify({ action, params }));
		};
	};

	private onlineTimerId: NodeJS.Timeout | null = null;
}
