import Adapter from './adapter';
import { MessageRaw } from './types';

export abstract class Api {
	public readonly adapter: Adapter<this>;

	public constructor(adapter: Adapter) {
		this.adapter = adapter as Adapter<this>;
	}

	public abstract readonly send_private_msg: (message: MessageRaw, userId: number) => /* Promise<unknown> | */ void;

	public abstract readonly send_group_msg: (message: MessageRaw, groupId: number) => /* Promise<unknown> | */ void;

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
