import { none } from '@kotori-bot/tools';
import Adapter from './adapter';
import { Msg } from './message';

export type sendFunc = (action: string, params?: object) => void;

const fakeSend: sendFunc = action => none(action);

export abstract class Api {
	public readonly adapter: Adapter<this>;

	public readonly send: sendFunc;

	public constructor(adapter: Adapter, send: sendFunc = fakeSend) {
		this.adapter = adapter as Adapter<this>;
		this.send = send;
	}

	public abstract readonly send_private_msg: (message: Msg, userId: number) => Promise<unknown> | void;

	public abstract readonly send_group_msg: (message: Msg, groupId: number) => Promise<unknown> | void;

	public abstract readonly delete_msg: (messageId: number) => void;

	public abstract readonly set_group_name: (groupId: number, groupName: string) => void;

	public abstract readonly set_group_avatar: (groupId: number, image: string) => void;

	public abstract readonly set_group_admin: (groupId: number, userId: number, enable: boolean) => void;

	public abstract readonly set_group_card: (groupId: number, userId: number, card: string) => void;

	public abstract readonly set_group_ban: (groupId: number, userId?: number, time?: number) => void;

	public abstract readonly send_group_notice: (groupId: number, content: string, image?: string) => void;

	public abstract readonly set_group_kick: (groupId: number, userId: number) => void;

	public abstract readonly set_group_leave: (groupId: number) => void;
}

export default Api;
