import type { Event, Api, EventDataType } from '@/tools';
import { stringProcess, stringSplit } from '@/tools';
import config from './config';
import run from './run';

class Main {
    /**
     * @param {Event} Event 事件
     * @param {Api} Api 接口
     * @param {Const} Const 常量(可选)
     */
    public constructor (private Event: Event, private Api: Api) {
        this.registerEvent()
    }

    /* 事件注册函数 */
    private registerEvent = () => {
        this.Event.listen('on_group_msg', eventData => this.handel(eventData));
        this.Event.listen('on_private_msg', eventData => this.handel(eventData));
    }

    /* 处理函数 */
    private handel = (data: EventDataType) => {
        /* 处理消息 */
        if (!stringProcess(data.message, config.cmd)) return;
        const code = stringSplit(data.message, config.cmd);
        const Entity = new run(code);
        Entity.run();
        let result = Entity.results;
        /* 发送 */
        if (!result) return;
        result = `Console Output:\n${result}`;
        data.group_id ? this.Api.send_group_msg(result, data.group_id) : this.Api.send_private_msg(result, data.user_id);
    }
}
export default Main;