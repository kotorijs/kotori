/*
 * @Author: Hotaru biyuehuya@gmail.com
 * @Blog: https://hotaru.icu
 * @Date: 2023-09-29 14:31:09
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2023-11-10 10:45:12
 */
import { Adapter, AdapterConfig, MessageRaw, EventDataMsgSender, isObj, Context } from 'kotori-bot';
import CmdApi from './api';

interface CmdConfig extends AdapterConfig {
	nickname: string;
	age: number;
	sex: EventDataMsgSender['sex'];
	'self-id': number;
	'self-nickname': string;
	'self-avatar': string;
}

function checkConfig(config: unknown): config is CmdConfig {
	if (!isObj(config)) return false;
	if (typeof config.nickname !== 'string') return false;
	if (typeof config.age !== 'number') return false;
	if (config.sex !== 'male' && config.sex !== 'female' && config.sex !== 'unknown') return false;
	if (typeof config['self-id'] !== 'number') return false;
	if (typeof config['self-nickname'] !== 'string') return false;
	if (typeof config['self-avatar'] !== 'string') return false;
	return true;
}

export default class CmdAdapter extends Adapter<CmdApi> {
	private messageId = 1;

	public config: CmdConfig;

	public constructor(
		config: Partial<keyof Omit<CmdConfig, keyof AdapterConfig>> & AdapterConfig,
		identity: string,
		ctx: Context,
	) {
		const defaultConfig: Omit<CmdConfig, keyof AdapterConfig> = {
			nickname: 'Kotarou',
			age: 18,
			sex: 'male',
			'self-id': 2333,
			'self-nickname': 'Kotori',
			'self-avatar': 'https://kotori.js.org/kotori.png',
		};
		const newConfig = Object.assign(defaultConfig, config);
		super(newConfig, identity, ctx, CmdApi);
		if (!checkConfig(newConfig)) throw new Error(`Bot '${identity}' config format error`);
		this.config = newConfig;
		this.selfId = this.config['self-id'];
		this.nickname = this.config['self-nickname'];
		this.avatar = this.config['self-avatar'];
		process.stdin.on('data', data => this.handle(data));
	}

	public handle = (data: Buffer) => {
		if (this.status.value !== 'online') return;
		let message = data.toString();
		if (message === '\n' || message === '\r\n') return;
		message = message.replace('\r\n', '').replace('\n', '');

		this.ctx.emit('private_msg', {
			messageId: this.messageId,
			message,
			userId: this.config.master,
			sender: {
				nickname: this.config.nickname,
				sex: this.config.sex,
				age: this.config.age,
			},
			send: (message: MessageRaw) => {
				this.api.send_private_msg(message, this.config.master);
			},
			api: this.api,
			locale: this.locale,
		});
		this.messageId += 1;
	};

	public start = () => {
		this.send = (action, params?) => {
			if (this.status.value !== 'online' || action !== 'send_private_msg' || !params) return;
			if (typeof (params as { message: string }).message !== 'string') return;
			if ((params as { user_id: unknown }).user_id !== this.config.master) return;
			process.stdout.write(`${this.nickname} > ${(params as { message: string }).message} \r\n`);
			this.messageId += 1;
			this.ctx.emit('send', {
				api: this.api,
				messageId: this.messageId,
			});
		};
		this.ctx.emit('connect', {
			adapter: this,
			normal: true,
			info: `start cmd-line listen`,
		});
		this.online();
	};

	public stop = () => {
		this.ctx.emit('disconnect', {
			adapter: this,
			normal: true,
			info: `stop cmd-line listen`,
		});
		this.offline();
	};
}
