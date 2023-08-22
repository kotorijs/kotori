/*
 * @Author: Hotaru biyuehuya@gmail.com
 * @Blog: http://imlolicon.tk
 * @Date: 2023-07-25 19:55:02
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2023-08-22 10:48:28
 */
import path from 'path';
import { encode } from 'js-base64';
import { Core } from 'plugins/kotori-core';
import { ACCESS, SCOPE } from 'plugins/kotori-core/type';
import { Locale } from '@/tools';
import config from './config';
import { loadConfigP, updateToken } from './method';
import { Token } from './type';

const { bot } = config;

Locale.register(path.resolve(__dirname));

Core.cmd(bot.cmd, () => {
	updateToken();
	const tokenHandle = encode((<Token>loadConfigP('token.json')).token);
	const path = `/#/verify/${tokenHandle}`;
	return [
		'kotori_bot_admin_server.cmd.login.info',
		{
			port: config.port,
			path,
			face_address: bot.faceaAddress,
			expire_time: config.web.expireTime,
		},
	];
})
	.descr('kotori_bot_admin_server.cmd.login.descr')
	.menuId('coreCom')
	.scope(bot.allowGroup ? SCOPE.ALL : SCOPE.PRIVATE)
	.access(ACCESS.ADMIN);
