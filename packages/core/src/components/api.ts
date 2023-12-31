import { none } from '@kotori-bot/tools';
import type Adapter from './adapter';
import type { EventDataTargetId, MessageRaw } from '../types';
import Elements from './elements';

interface ApiImpl {
	readonly adapter: Adapter<this>;

	/* Adapter Api */
	// locale(val: string): string;
	/* Platform Api */
	send_private_msg(message: MessageRaw, userId: EventDataTargetId): /* Promise<unknown> | */ void;

	send_group_msg(message: MessageRaw, groupId: EventDataTargetId): /* Promise<unknown> | */ void;

	delete_msg(messageId: EventDataTargetId): void;

	set_group_name(groupId: EventDataTargetId, groupName: string): void;

	set_group_avatar(groupId: EventDataTargetId, image: string): void;

	set_group_admin(groupId: EventDataTargetId, userId: EventDataTargetId, enable: boolean): void;

	set_group_card(groupId: EventDataTargetId, userId: EventDataTargetId, card: string): void;

	set_group_ban(groupId: EventDataTargetId, userId?: EventDataTargetId, time?: number): void;

	send_group_notice(groupId: EventDataTargetId, content: string, image?: string): void;

	set_group_kick(groupId: EventDataTargetId, userId: EventDataTargetId): void;

	set_group_leave(groupId: EventDataTargetId): void;

	elements: Elements;
}

export abstract class Api implements ApiImpl {
	public readonly adapter: Adapter<this>;

	public elements: Elements;

	public constructor(adapter: Adapter, el: Elements) {
		this.adapter = adapter as Adapter<this>;
		this.elements = el;
	}

	public send_private_msg(message: MessageRaw, userId: EventDataTargetId, extra?: unknown) {
		none(this, message, userId, extra);
	}

	public send_group_msg(message: MessageRaw, groupId: EventDataTargetId, extra?: unknown) {
		none(this, message, groupId, extra, extra);
	}

	public delete_msg(messageId: EventDataTargetId, extra?: unknown) {
		none(this, messageId, extra);
	}

	public set_group_name(groupId: EventDataTargetId, groupName: string, extra?: unknown) {
		none(this, groupId, groupName, extra);
	}

	public set_group_avatar(groupId: EventDataTargetId, image: string, extra?: unknown) {
		none(this, groupId, image, extra);
	}

	public set_group_admin(groupId: EventDataTargetId, userId: EventDataTargetId, enable: boolean, extra?: unknown) {
		none(this, groupId, userId, enable, extra);
	}

	public set_group_card(groupId: EventDataTargetId, userId: EventDataTargetId, card: string, extra?: unknown) {
		none(this, groupId, userId, card, extra);
	}

	public set_group_ban(groupId: EventDataTargetId, userId?: EventDataTargetId, time?: number, extra?: unknown) {
		none(this, groupId, userId, time, extra);
	}

	public send_group_notice(groupId: EventDataTargetId, content: string, image?: string, extra?: unknown) {
		none(this, groupId, content, image, extra);
	}

	public set_group_kick(groupId: EventDataTargetId, userId: EventDataTargetId, extra?: unknown) {
		none(this, groupId, userId, extra);
	}

	public set_group_leave(groupId: EventDataTargetId, extra?: unknown) {
		none(this, groupId, groupId, extra);
	}
}

export default Api;
