/*
 * @Author: Hotaru biyuehuya@gmail.com
 * @Blog: https://hotaru.icu
 * @Date: 2023-09-29 14:31:09
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2023-12-02 22:55:15
 */
import { Adapter, AdapterConfig, Context, obj } from 'kotori-bot';
import WebSocket from 'ws';
import QQApi from './api';

/* function checkConfig(config: unknown): config is AdapterConfig {
	if (!isObj(config)) return false;
	if (typeof config.port !== 'number') return false;
	if (config.mode === 'ws') {
		return typeof config.retry === 'number' && typeof config.address === 'string';
	}
	if (config.mode === 'ws-reverse') {
		return true;
	}
	return false;
} */

interface QQAdapterConfig extends AdapterConfig {
	appid: string;
	secret: string;
	retry: number;
}

export class QQAdapter extends Adapter<QQApi> {
	private token = '';

	private seq = 0;

	private msg_seq = 0;

	private readonly address = 'wss://api.sgroup.qq.com/websocket';

	public readonly config: QQAdapterConfig;

	public constructor(ctx: Context, config: QQAdapterConfig, identity: string) {
		super(ctx, config, identity, QQApi);
		// if (!checkConfig(config)) throw new Error(`Bot '${identity}' config format error`);
		this.config = config;
	}

	public handle(data: obj) {
		if (data.op === 10) {
			this.send('ws', {
				op: 2,
				d: {
					token: `QQBot ${this.token}`,
					intents: 1241513984,
					shard: [0, 1],
				},
			});
			console.log('login...');
		} else if (data.t === 'READY') {
			console.log('login success');
			this.heartbeat();
		} else if (data.t === 'GROUP_AT_MESSAGE_CREATE') {
			this.emit('group_msg', {
				userId: 233,
				messageId: 233,
				message: data.d.content.trim(),
				sender: {
					nickname: '233',
					age: 222,
					sex: 'unknown',
				},
				groupId: data.group_id!,
			});
			console.log('group');
		} else if (data.op === 11) {
			this.online();
			// this.offlineCheck();
		}
		console.log(data);

		if (data.s) this.seq = data.s;

		// if (!this.onlineTimerId) this.onlineTimerId = setTimeout(() => this.offline, 50 * 1000);
	}

	public start() {
		this.ctx.emit('connect', {
			adapter: this,
			normal: true,
			info: `connect server to qqbot`,
		});
		this.getToken();
		this.connect();
	}

	public stop() {
		this.ctx.emit('disconnect', {
			adapter: this,
			normal: true,
			info: `disconnect from ${this.address}`,
		});
		this.socket?.close();
		this.offline();
	}

	public send(action: string, params: object) {
		if (action === 'ws') {
			this.socket?.send(JSON.stringify(params));
			return undefined;
		}
		let address = '';
		let req: obj = {};
		if (action === 'send_group_msg' && 'groupId' in params && 'message' in params && 'id' in params) {
			if (!params.message) return null;
			this.msg_seq += 1;
			address = `groups/${params.groupId}/messages`;
			req = {
				content: params.message,
				msg_type: 0,
				msg_id: params.id,
				msg_seq: this.msg_seq,
			};
		}
		return this.ctx.http.post(`https://api.sgroup.qq.com/v2/${address}`, req, {
			headers: {
				Authorization: `QQBot ${this.token}`,
				'X-Union-Appid': this.config.appid,
			},
			validateStatus: () => true,
		});
	}

	private socket: WebSocket | null = null;

	private async connect() {
		this.socket = new WebSocket(`${this.address}`);
		this.socket.on('close', () => {
			this.ctx.emit('disconnect', {
				adapter: this,
				normal: false,
				info: `unexpected disconnect server from ${this.address}, will reconnect in ${this.config.retry} seconds`,
			});
			setTimeout(() => {
				if (!this.socket) return;
				this.socket.close();
				this.ctx.emit('connect', {
					adapter: this,
					normal: false,
					info: `reconnect server to ${this.address}`,
				});
				this.start();
			}, this.config.retry * 1000);
		});
		this.socket.on('message', data => this.handle(JSON.parse(data.toString())));
	}

	private async getToken() {
		const data = await this.ctx.http.post('https://bots.qq.com/app/getAppAccessToken', {
			appId: this.config.appid,
			clientSecret: this.config.secret,
		}) as any;
		if (!data.access_token) {
			this.offline();
			console.log('gettoken error', data);
			return;
		}
		this.token = data.access_token;
		console.log(`new token ${this.token}`);
		this.getTokenTimerId = setTimeout(
			() => {
				if (this.getTokenTimerId) clearInterval(this.getTokenTimerId);
				this.getToken();
			},
			(parseInt(data.expires_in, 10) - 30) * 1000,
		);
	}

	private async heartbeat() {
		this.heartbeatTimerId = setTimeout(() => {
			this.send('ws', {
				op: 1,
				d: this.seq || null,
			});
			if (this.heartbeatTimerId) clearInterval(this.heartbeatTimerId);
			this.heartbeat();
		}, 7 * 1000);
	}

	/* global NodeJS */
	private getTokenTimerId?: NodeJS.Timeout;

	private heartbeatTimerId?: NodeJS.Timeout;
}

export default QQAdapter;