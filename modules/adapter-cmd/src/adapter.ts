/*
 * @Author: Hotaru biyuehuya@gmail.com
 * @Blog: https://hotaru.icu
 * @Date: 2023-09-29 14:31:09
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2023-10-06 15:59:37
 */
import { Adapter, AdapterConfig, Events, Msg, eventDataMsgSender, isObj } from '@kotori-bot/kotori';
import CmdApi from './api';

interface Iconfig extends AdapterConfig {
	nickname: string;
	age: number;
	sex: eventDataMsgSender['sex'];
}

function checkConfig(config: unknown): config is Iconfig {
	if (!isObj(config)) return false;
	if (typeof config.nickname !== 'string') return false;
	if (typeof config.age !== 'number') return false;
	if (config.sex !== 'male' && config.sex !== 'female' && config.sex !== 'unknown') return false;
	return true;
}

export default class CmdAdapter extends Adapter<CmdApi> {
	private messageId = 0;

	public api: CmdApi = new CmdApi(this);

	public readonly platform: string = 'cmd';

	public declare config: Iconfig;

	public constructor(config: AdapterConfig, identity: string) {
		const defaultConfig = {
			nickname: 'Kotarou',
			age: 18,
			sex: 'male',
		};
		const newConfig = Object.assign(defaultConfig, config);
		super(newConfig, identity);
		if (!checkConfig(newConfig)) throw new Error(`Bot '${identity}' config format error`);
		this.config = newConfig;
		process.stdin.on('data', data => this.handle(data));
	}

	public handle = (data: Buffer) => {
		if (this.status.value !== 'online') return;
		const message = data.toString();
		if (message === '\n' || message === '\r\n') return;
		Adapter.emit({
			type: 'private_msg',
			messageId: this.messageId,
			message,
			userId: this.config.master,
			sender: {
				nickname: this.config.nickname,
				sex: this.config.sex,
				age: this.config.age,
			},
			send: (message: Msg) => {
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
			process.stdout.write(`> ${(params as { message: string }).message} \r\n`);
		};
		Events.emit({
			type: 'connect',
			adapter: this,
			normal: true,
			info: `start cmd-line listen`,
		});
		this.online();
	};

	public stop = () => {
		Events.emit({
			type: 'disconnect',
			adapter: this,
			normal: true,
			info: `stop cmd-line listen`,
		});
		this.offline();
	};
}
