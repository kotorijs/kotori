/*
 * @Author: Hotaru biyuehuya@gmail.com
 * @Blog: http://imlolicon.tk
 * @Date: 2023-07-25 19:55:02
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2023-08-15 11:10:20
 */
import config from './config';
import { encode } from 'js-base64';
import { loadConfigP, updateToken } from "./method";
import { Token } from "./interface";
import { Cmd } from "plugins/kotori-core";
import { ACCESS, SCOPE, Send } from "plugins/kotori-core/interface";

const { bot } = config;

const handle = (send: Send) => {
    updateToken();
    const tokenHandle = encode((<Token>loadConfigP('token.json')).token);
    const path = `/#/verify/${tokenHandle}`;
    send(bot.info, {
        port: config.port,
        path,
        face_address: bot.faceaAddress,
        expire_time: config.web.expireTime,
    });
}

Cmd.register(bot.cmd, bot.descr, 'superMange', bot.allowGroup ? SCOPE.ALL : SCOPE.PRIVATE, ACCESS.ADMIN, handle);