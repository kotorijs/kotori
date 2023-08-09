/*
 * @Author: Hotaru biyuehuya@gmail.com
 * @Blog: http://imlolicon.tk
 * @Date: 2023-07-25 19:55:02
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2023-08-06 18:22:52
 */
import { fetchText } from "@/tools";
import type { Api, Const, Event, EventDataType } from "@/tools/interface";
import config from './config';
import { encode } from 'js-base64';
import { loadConfigP, updateToken } from "./method";
import { Token } from "./interface";

const GlobalVar = {
    GET_OWN_IP_ADDRESS: 'https://ip.3322.net/'
}

export default (Event: Event, Api: Api, Const: Const) => {
    const handle = (data: EventDataType) => {
        const send = (message: string) => {
            data.message_type === 'private' ? Api.send_private_msg(message, data.user_id) : Api.send_group_msg(message, data.group_id!);
        }

        if (data.message !== '/login') return;

        if (data.user_id !== Const.CONFIG.bot.master) {
            send('您无权限执行该指令')
            return;
        }

        updateToken();
        const tokenHandle = encode((<Token>loadConfigP('token.json')).token);
        const URL = `:${config.port}/#/verify/${tokenHandle}`;
        fetchText(GlobalVar.GET_OWN_IP_ADDRESS)
            .then(realIp => {
                let message = (
                    `以下是您的BOT后台管理的一键登录地址:` +
                    `\nhttp://127.0.0.1${URL}` +
                    // `\n${config.bot.faceaAdress}${URL}` +
                    `\nhttp://${realIp.substring(0, realIp.length - 1)}${URL}` +
                    `\n登录地址将在[300秒]后过期，请勿泄露给他人`
                );
                config.bot.allowGroupToken ? send(message) : (() => {
                    Api.send_private_msg(message, data.user_id);
                    data.group_id && Api.send_group_msg('登录信息已私信发送，如若未收到请先添加BOT好友', data.group_id);
                })();
            });
    }
    Event.listen('on_group_msg', (data) => handle(data))
    Event.listen('on_private_msg', (data) => handle(data))
}
