import type { Event, Api, Const, EventDataType } from "@/tools";
import { stringProcess, stringSplit } from "@/tools";

/**
 * @param {Event} Event 事件
 * @param {Api} Api 接口
 * @param {Const} Const 常量(可选)
 */
export default (Event: Event, Api: Api, Const: Const) => {
    /* 注册事件 */
    Event.listen("on_group_msg", (eventData: EventDataType) => handel(eventData));
    Event.listen("on_private_msg", (data: EventDataType) => {
        if (data.message !== "print") return;
        Api.send_private_msg(Const.DATA_PLUGIN_PATH , data.user_id);
    });

    /* 处理函数 */
    const handel = (data: EventDataType) => {
        /* 处理消息 */
        if (!stringProcess(data.message, "echo ")) return;
        const message = stringSplit(data.message, "echo ");
        /* 发送 */
        message && Api.send_group_msg(message, data.group_id!);
    }
};