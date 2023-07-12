/*
 * @Author: Biyuehu biyuehuya@gmail.com
 * @Blog: http://imlolicon.tk
 * @Date: 2023-05-28 10:46:41
 */

import { EventHandle, EventList, EventDataType } from "../interface";

export class Event {
    private on_private_msg: EventHandle = (data, callback) => {
        if (data.post_type === 'message' && data.message_type === 'private') {
            callback(data);
        }
    }

    private on_group_msg: EventHandle = (data, callback) => {
        if (data.post_type === 'message' && data.message_type === 'group') {
            callback(data);
        }
    }

    private on_friend_recall: EventHandle = (data, callback) => {
        if (data.post_type === 'notice' && data.notice_type === 'friend_recall') {
            callback(data);
        }
    }

    private on_group_recall: EventHandle = (data, callback) => {
        if (data.post_type === 'notice' && data.notice_type === 'group_recall') {
            callback(data);
        }
    }

    private on_group_increase: EventHandle = (data, callback) => {
        if (data.post_type === 'notice' && data.notice_type === 'group_increase') {
            callback(data);
        }
    }

    private on_group_decrease: EventHandle = (data, callback) => {
        if (data.post_type === 'notice' && data.notice_type === 'group_decrease') {
            callback(data);
        }
    }

    private on_group_admin: EventHandle = (data, callback) => {
        if (data.post_type === 'notice' && data.notice_type === 'group_admin') {
            callback(data);
        }
    }

    private on_group_upload: EventHandle = (data, callback) => {
        if (data.post_type === 'notice' && data.notice_type === 'group_upload') {
            callback(data);
        }
    }

    private on_group_ban: EventHandle = (data, callback) => {
        if (data.post_type === 'notice' && data.notice_type === 'group_ban') {
            callback(data);
        }
    }

    private on_friend_add: EventHandle = (data, callback) => {
        if (data.post_type === 'notice' && data.notice_type === 'friend_add') {
            callback(data);
        }
    }

    private on_notify: EventHandle = (data, callback) => {
        if (data.post_type === 'notice' && data.notice_type === 'notify') {
            callback(data);
        }
    }

    private on_group_card: EventHandle = (data, callback) => {
        if (data.post_type === 'notice' && data.notice_type === 'group_card') {
            callback(data);
        }
    }

    private on_offline_file: EventHandle = (data, callback) => {
        if (data.post_type === 'notice' && data.notice_type === 'offline_file') {
            callback(data);
        }
    }

    private on_client_status: EventHandle = (data, callback) => {
        if (data.post_type === 'notice' && data.notice_type === 'client_status') {
            callback(data);
        }
    }

    private on_essence: EventHandle = (data, callback) => {
        if (data.post_type === 'notice' && data.notice_type === 'essence') {
            callback(data);
        }
    }

    private on_friend_request: EventHandle = (data, callback) => {
        if (data.post_type === 'request' && data.request_type === 'friend') {
            callback(data);
        }
    }

    private on_group_request: EventHandle = (data, callback) => {
        if (data.post_type === 'request' && data.request_type === 'group') {
            callback(data);
        }
    }

    private on_heartbeat: EventHandle = (data, callback) => {
        if (data.post_type === 'meta_event' && data.meta_event_type === 'heartbeat') {
            callback(data);
        }
    }

    private on_meta_event: EventHandle = (data, callback) => {
        if (data.post_type === 'meta_event' && data.meta_event_type === 'lifecycle') {
            callback(data);
        }
    }

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
        on_meta_event: this.on_meta_event
    }

    public registerEvent = (list: [string, Function][], eventName: string, callback: Function) => {
        list.push([eventName, callback])
    }

    public handleEvent = (list: [string, Function][], eventData: EventDataType) => {
        list.forEach(element => {
            this.handleEventList[element[0]](eventData, element[1]);
        })
    }
}

export default Event;
