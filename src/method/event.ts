/*
 * @Author: Biyuehu biyuehuya@gmail.com
 * @Blog: http://imlolicon.tk
 * @Date: 2023-05-28 10:46:41
 */
import { obj } from '../function';

class Event {
    private on_private_msg = (data: obj, callback: Function) => {
        if (data.post_type === 'message' && data.message_type === 'private') {
            callback(data);
        }
    }

    private on_group_msg = (data: obj, callback: Function) => {
        if (data.post_type === 'message' && data.message_type === 'group') {
            callback(data);
        }
    }

    private handleEventList: obj = {
        on_private_msg: this.on_private_msg,
        on_group_msg: this.on_group_msg
    }

    public registerEvent = (list: [string, Function][], eventName: string, callback: Function) => {
        list.push([eventName, callback])
    }

    public handleEvent = (list: [string, Function][], data: obj) => {
        const eventData = {
            post_type: data.post_type,
            message_type: data.message_type,
            time: data.time,
            self_id: data.self_id,
            sub_type: data.sub_type,
            message: data.message,
            user_id: data.user_id,
            group_id: data.group_id,
            sender: data.sender
        }
        list.forEach(element => {
            this.handleEventList[element[0]](eventData, element[1]);
        })
    }
}

export default Event;
