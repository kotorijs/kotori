/*
 * @Author: Hotaru biyuehuya@gmail.com
 * @Blog: http://imlolicon.tk
 * @Date: 2023-07-30 11:33:15
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2023-08-03 11:41:58
 */
import { Api, Const, Event, EventDataType, loadConfig, saveConfig } from "@/tools";
import config from "./config";
import SDK from "@/utils/class.sdk";

const getNewLength = () => {
    const { max, min } = config;
    const range = max - min + 1;
    const index = Math.floor(Math.random() * range);
    const result = min + index;
    return result;
}

const getTime = () => {
    const TIME = new Date();
    return `${TIME.getFullYear()}-${TIME.getMonth() + 1}-${TIME.getDate()}`;
}

export default (Event: Event, Api: Api, Const: Const) => {
    Event.listen('on_group_msg', data => handle(data));
    Event.listen('on_private_msg', data => handle(data));
    const handle = (eventData: EventDataType) => {
        const DATA_PATH = `${Const.DATA_PLUGIN_PATH}\\${getTime()}.json`;
        const send = (message: string) => {
            eventData.message_type === 'private' ? Api.send_private_msg(message, eventData.user_id) : Api.send_group_msg(SDK.cq_at(eventData.user_id) + message, eventData.group_id!);
        }

        if (eventData.message !== config.cmd) return;
        const data = loadConfig(DATA_PATH) as number[] || [];
        let today_length: number = data[eventData.user_id] || getNewLength();
        send(`今日的牛~牛长度是` +
            (today_length > 0 ? `${today_length}cm` : `....今天你是女孩子(${today_length}cm)`)
        );
        if (!data[eventData.user_id]) {
            data[eventData.user_id] = today_length;
            saveConfig(DATA_PATH, data);
        }
    }
}