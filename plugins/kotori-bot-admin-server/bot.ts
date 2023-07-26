import { stringProcess } from "@/function";
import { Api, Const, Event, EventDataType } from "@/interface";
import config from './config';
import { encode } from 'js-base64';
import { loadConfigP, updateToken } from "./method";
import { Token } from "./interface";

export default (Event: Event, Api: Api, Const: Const) => {
    const handle = (data: EventDataType) => {
        const send = (message: string) => {
            data.message_type === 'private' ? Api.send_private_msg(message, data.user_id) : Api.send_group_msg(message, data.group_id!);
        }

        if (stringProcess(data.message, '/login')) {
            if (data.user_id === Const._CONFIG.bot.master) {
                updateToken();
                const tokenHandle = encode((<Token>loadConfigP('token.json')).token);
                let message = ` 以下是您的BOT后台管理的一键登录地址：`;
                message += `\nhttp://127.0.0.1:${config.port}/#/verify/${tokenHandle}`;
                message += `\n登录地址将在[300秒]后过期，请勿泄露给他人`
                config.bot.allowgrouptoken ? send(message) : (() => {
                    Api.send_private_msg(message, data.user_id);
                    data.group_id && Api.send_group_msg('登录信息已私信发送，如若未收到请先添加BOT好友', data.group_id);
                })()
            } else {
                send('您无权限执行该指令');
            }
        }
    }
    Event.listen('on_group_msg', (data) => handle(data))
    Event.listen('on_private_msg', (data) => handle(data))
}