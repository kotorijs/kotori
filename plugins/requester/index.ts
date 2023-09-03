import path from 'path';
import { temp } from 'plugins/kotori-core';
import { Api, Const, Event, EventDataType, Locale, obj } from '@/tools';
import config from './config';

Locale.register(path.resolve(__dirname));

export default class {
	private Api: Api;

	private Consts: Const;

	public constructor(event: Event, api: Api, Consts: Const) {
		this.Api = api;
		this.Consts = Consts;
		if (config.onGroupIncrease) event.listen('on_group_increase', data => this.onGroupIncrease(data));
		if (config.onGroupDecrease) event.listen('on_group_decrease', data => this.onGroupDecrease(data));
		if (config.onGroupAdmin) event.listen('on_group_admin', data => this.onGroupAdmin(data));
		if (config.onGroupBan) event.listen('on_group_ban', data => this.onGroupBan(data));
		if (config.onGroupRecall) event.listen('on_group_recall', data => this.onGroupRecall(data));
		if (config.onFriendRecall) event.listen('on_friend_recall', data => this.onFriendRecall(data));
		if (config.onGroupRequest) event.listen('on_group_request', data => this.onGroupRequest(data));
		if (config.onFriendRequest) event.listen('on_friend_request', data => this.onFriendRequest(data));
		if (config.onGroupMsg) event.listen('on_group_msg', data => this.onGroupMsg(data));
		if (config.onPrivateMsg) event.listen('on_private_msg', data => this.onPrivateMsg(data));
	}

	private messageData: string[] = [];

	private send = (message: string, data: obj<string | number>) => {
		this.Api.send_private_msg(temp(message, data), this.Consts.CONFIG.bot.master);
	};

	private onGroupIncrease = (data: EventDataType) => {
		if (data.user_id !== this.Consts.BOT.self_id) return;
		this.send(`requester.msg.increase.${data.sub_type === 'approve' ? 'approve' : 'invite'}`, {
			operator: data.operator_id!,
			group: data.group_id!,
		});
	};

	private onGroupDecrease = (data: EventDataType) => {
		if (data.user_id !== this.Consts.BOT.self_id) return;
		this.send(`requester.msg.decrease.${data.operator_id === data.user_id ? 'leave' : 'kick'}`, {
			operator: data.operator_id!,
			group: data.group_id!,
		});
	};

	private onGroupAdmin = (data: EventDataType) => {
		if (data.user_id !== this.Consts.BOT.self_id) return;
		this.send(`requester.msg.admin.${data.user_id ? 'set' : 'unset'}`, {
			operator: data.operator_id!,
			group: data.group_id!,
		});
	};

	private onGroupBan = (data: EventDataType) => {
		if (data.user_id !== this.Consts.BOT.self_id) return;
		this.send(`requester.msg.ban.${data.duration && data.duration > 0 ? 'ban' : 'lift_ban'}`, {
			operator: data.operator_id!,
			group: data.group_id!,
			time: data.duration ? data.duration / 60 : 0,
		});
	};

	private onGroupRecall = (data: EventDataType) => {
		if (data.user_id === this.Consts.BOT.self_id || data.operator_id === this.Consts.BOT.self_id) return;
		this.send(`requester.msg.recall.group.${data.operator_id === data.user_id ? 'self' : 'other'}`, {
			user: data.user_id,
			operator: data.operator_id!,
			message: this.messageData[data.message_id],
			group: data.group_id!,
		});
	};

	private onFriendRecall = (data: EventDataType) => {
		if (data.user_id === this.Consts.BOT.self_id) return;
		this.send(`requester.msg.recall.private`, {
			user: data.user_id,
			message: this.messageData[data.message_id],
		});
	};

	private onGroupRequest = (data: EventDataType) => {
		this.send(`requester.msg.request.group.${data.sub_type === 'invite' ? 'invite' : 'add'}`, {
			user: data.user_id,
			group: data.group_id!,
			message: data.message,
		});
	};

	private onFriendRequest = (data: EventDataType) => {
		this.send(`requester.msg.request.private`, {
			user: data.user_id,
			message: data.message,
		});
	};

	private onGroupMsg = (data: EventDataType) => {
		this.messageData[data.message_id] = data.message;
		if (data.user_id === this.Consts.BOT.self_id || !data.message.includes(this.Consts.BOT.self_id.toString()))
			return;
		this.send(`requester.msg.msg.group`, {
			user: data.user_id,
			group: data.group_id!,
			message: data.message,
		});
	};

	private onPrivateMsg = (data: EventDataType) => {
		this.messageData[data.message_id] = data.message;
		if (
			data.user_id === this.Consts.BOT.self_id ||
			data.message.includes('/') ||
			data.user_id === this.Consts.CONFIG.bot.master
		)
			return;
		this.send(`requester.msg.msg.private`, {
			user: data.user_id,
			message: data.message,
		});
	};
}
