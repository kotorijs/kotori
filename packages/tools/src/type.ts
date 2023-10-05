/*
 * @Author: hotaru biyuehuya@gmail.com
 * @Blog: https://hotaru.icu
 * @Date: 2023-07-12 15:42:18
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2023-09-30 18:55:45
 */

export interface obj<T = any> {
	[key: string]: T;
}

export type ConfigFileType = 'json' | 'yaml' /* | 'xml' | 'ini'  */ | 'txt';
export type FuncStringProcessStr = string | number;
export type FuncStringProcessKey = FuncStringProcessStr | Array<string | number>;
export type FuncStringProcessMode = 0 | 1 | 2;
export type StringTempArgs = obj<string | number>;

/* export const enum LOG_PREFIX {
	CONNECT = '[Connect]',
	PLUGIN = '[Plugin]',
	WEB = '[Web]',
	CORE = '[Kotori]',
	CMD = '[Result]',
	GCQ = '[Gocq]',
} */
/* 
export const enum PROCESS_CMD {
	HELP = 'help',
	STOP = 'stop',
	BOT = 'bot',
	PLUGIN = 'plugin',
	PASSWORD = 'password',
	SEND = 'send',
	SYS = 'system',
}

export const enum PLUGIN_GLOBAL {
	CORE_PLUGIN = 'kotori-core',
	ADMIN_PLUGIN = 'kotori-bot-admin-server',
} */
