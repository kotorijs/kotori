/*
 * @Author: Hotaru biyuehuya@gmail.com
 * @Blog: http://imlolicon.tk
 * @Date: 2023-06-24 15:12:55
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2023-08-18 17:03:53
 */
import { BOTCONFIG } from '@/tools';
import { EventList, EventDataType, LOG_PREFIX, BotConfigFilter, FuncListenCallback } from '../tools/interface';

class EVENT {
	private on_private_msg = () => {
		if (this.event!.post_type === 'message' && this.event!.message_type === 'private') {
			this.callback!(this.event!);
		}
	};

	private on_group_msg = () => {
		if (this.event!.post_type === 'message' && this.event!.message_type === 'group') {
			this.callback!(this.event!);
		}
	};

	private on_friend_recall = () => {
		if (this.event!.post_type === 'notice' && this.event!.notice_type === 'friend_recall') {
			this.callback!(this.event!);
		}
	};

	private on_group_recall = () => {
		if (this.event!.post_type === 'notice' && this.event!.notice_type === 'group_recall') {
			this.callback!(this.event!);
		}
	};

	private on_group_increase = () => {
		if (this.event!.post_type === 'notice' && this.event!.notice_type === 'group_increase') {
			this.callback!(this.event!);
		}
	};

	private on_group_decrease = () => {
		if (this.event!.post_type === 'notice' && this.event!.notice_type === 'group_decrease') {
			this.callback!(this.event!);
		}
	};

	private on_group_admin = () => {
		if (this.event!.post_type === 'notice' && this.event!.notice_type === 'group_admin') {
			this.callback!(this.event!);
		}
	};

	private on_group_upload = () => {
		if (this.event!.post_type === 'notice' && this.event!.notice_type === 'group_upload') {
			this.callback!(this.event!);
		}
	};

	private on_group_ban = () => {
		if (this.event!.post_type === 'notice' && this.event!.notice_type === 'group_ban') {
			this.callback!(this.event!);
		}
	};

	private on_friend_add = () => {
		if (this.event!.post_type === 'notice' && this.event!.notice_type === 'friend_add') {
			this.callback!(this.event!);
		}
	};

	private on_notify = () => {
		if (this.event!.post_type === 'notice' && this.event!.notice_type === 'notify') {
			this.callback!(this.event!);
		}
	};

	private on_group_card = () => {
		if (this.event!.post_type === 'notice' && this.event!.notice_type === 'group_card') {
			this.callback!(this.event!);
		}
	};

	private on_offline_file = () => {
		if (this.event!.post_type === 'notice' && this.event!.notice_type === 'offline_file') {
			this.callback!(this.event!);
		}
	};

	private on_client_status = () => {
		if (this.event!.post_type === 'notice' && this.event!.notice_type === 'client_status') {
			this.callback!(this.event!);
		}
	};

	private on_essence = () => {
		if (this.event!.post_type === 'notice' && this.event!.notice_type === 'essence') {
			this.callback!(this.event!);
		}
	};

	private on_friend_request = () => {
		if (this.event!.post_type === 'request' && this.event!.request_type === 'friend') {
			this.callback!(this.event!);
		}
	};

	private on_group_request = () => {
		if (this.event!.post_type === 'request' && this.event!.request_type === 'group') {
			this.callback!(this.event!);
		}
	};

	private on_heartbeat = () => {
		if (this.event!.post_type === 'meta_event' && this.event!.meta_event_type === 'heartbeat') {
			this.callback!(this.event!);
		}
	};

	private on_meta_event = () => {
		if (this.event!.post_type === 'meta_event' && this.event!.meta_event_type === 'lifecycle') {
			this.callback!(this.event!);
		}
	};

	private handleEventList: EventList = {
		on_private_msg: this.on_private_msg,
		on_group_msg: this.on_group_msg,
		on_friend_recall: this.on_friend_recall,
		on_group_recall: this.on_group_recall,
		on_group_increase: this.on_group_increase,
		on_group_decrease: this.on_group_decrease,
		on_group_admin: this.on_group_admin,
		on_group_upload: this.on_group_upload,
		on_group_ban: this.on_group_ban,
		on_friend_add: this.on_friend_add,
		on_notify: this.on_notify,
		on_group_card: this.on_group_card,
		on_offline_file: this.on_offline_file,
		on_client_status: this.on_client_status,
		on_essence: this.on_essence,
		on_friend_request: this.on_friend_request,
		on_group_request: this.on_group_request,
		on_heartbeat: this.on_heartbeat,
		on_meta_event: this.on_meta_event,
	};

	private recordLog = () => {
		if (this.event!.post_type !== 'message') return;
		const type = this.event!.message_type === 'group' ? 'group' : 'private';
		console.log(
			LOG_PREFIX.CONNECT,
			`Receive ${type} msg ${this.event!.message} user: ${this.event!.user_id}${
				this.event!.group_id ? ` group: ${this.event!.group_id}` : ''
			}`,
		);
	};

	private eventFilter = () => {
		const config = BOTCONFIG;

		if (this.event!.group_id) {
			const { type } = config.bot.groups;
			if (type === BotConfigFilter.CLOSE) return true;
			const result = config.bot.groups.list.includes(this.event!.group_id);
			if (!result && type === BotConfigFilter.BLACK) return true;
			if (result && type === BotConfigFilter.WHITE) return true;
			return false;
		}
		const { type } = config.bot.users;
		const result = config.bot.users.list.includes(this.event!.user_id);
		if (type === BotConfigFilter.CLOSE) return true;
		if (!result && type === BotConfigFilter.BLACK) return true;
		if (result && type === BotConfigFilter.WHITE) return true;
		return false;
	};

	private event: EventDataType | null = null;

	private callback: FuncListenCallback | null = null;

	private registerEventList: [string, FuncListenCallback][] = [];

	public registerEvent = (eventName: string, callback: FuncListenCallback) => {
		this.registerEventList.push([eventName, callback]);
	};

	public handleEvent = (eventData: EventDataType) => {
		if (!this.eventFilter()) return;
		this.recordLog();
		this.event = eventData;
		this.registerEventList.forEach(element => {
			const { 1: callback } = element;
			this.callback = callback;
			this.handleEventList[element[0] as keyof EventList]();
		});
	};
}

export default EVENT;
