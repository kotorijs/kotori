/*
 * @Author: Hotaru biyuehuya@gmail.com
 * @Blog: http://imlolicon.tk
 * @Date: 2023-07-15 15:52:17
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2023-08-18 17:43:13
 */
import os from 'os';
import { existsSync } from 'fs';
import path from 'path';
import { version as versionTs } from 'typescript';
import { VERSION as versionTsnode } from 'ts-node';
import { LOG_PREFIX, fetchJson, fetchText, isObj, isObjArr, loadConfig, saveConfig, stringTemp } from '@/tools';
import type { FuncFetchSuper, FuncStringProcessStr, obj } from '@/tools';
import { CONTROL_PARAMS, Res, Send } from './interface';
import { URL } from './menu';
import SDK from '@/utils/class.sdk';
import { BOT_RESULT, GLOBAL } from './lang/zh_cn';

export const dealTime = () => {
	const seconds = Math.floor(os.uptime());
	let day: FuncStringProcessStr = Math.floor(seconds / (3600 * 24));
	let hours: FuncStringProcessStr = Math.floor((seconds - day * 3600 * 24) / 3600);
	let minutes: FuncStringProcessStr = Math.floor((seconds - day * 3600 * 24 - hours * 3600) / 60);
	let second: FuncStringProcessStr = seconds % 60;

	if (day < 10) {
		day = `0${day}`;
	}

	if (hours < 10) {
		hours = `0${hours}`;
	}

	if (minutes < 10) {
		minutes = `0${minutes}`;
	}

	if (second < 10) {
		second = `0${second}`;
	}

	return [day, hours, minutes, second].join(':');
};

export const dealRam = () => {
	const total = os.totalmem() / 1024 / 1024 / 1024;
	const unused = os.freemem() / 1024 / 1024 / 1024;
	const used = total - unused;
	const rate = (used / total) * 100;
	return {
		total,
		unused,
		used,
		rate,
	};
};

export const dealCpu = () => {
	const cpuData = os.cpus();
	let rate: number = 0;
	const ratearr: number[] = [];
	cpuData.forEach(key => {
		const { times } = key;
		const usage = (1 - times.idle / (times.idle + times.user + times.nice + times.sys + times.irq)) * 100;
		ratearr.push(usage);
		rate += usage;
	});
	return {
		model: cpuData[0].model,
		speed: cpuData[0].speed / 1024,
		num: cpuData.length,
		rate,
		ratearr,
	};
};

export const dealEnv = () => ({
	node: process.versions.node,
	typescript: versionTs,
	tsnode: versionTsnode,
});

export const fetchJ: FuncFetchSuper<Res> = async (url, params, init) =>
	fetchJson(url.substring(0, 4) === 'http' ? url : URL.API + url, params, init) as unknown as Res;

export const fetchT: FuncFetchSuper<string | void> = async (url, params, init) =>
	fetchText(url.substring(0, 4) === 'http' ? url : URL.API + url, params, init);

export const fetchBGM: FuncFetchSuper<obj> = async (url, params) =>
	fetchJson(`${URL.BGM}${url}`, params, {
		headers: {
			'user-agent': 'czy0729/Bangumi/6.4.0 (Android) (http://github.com/czy0729/Bangumi)',
		},
	});

export const con = {
	log: (...args: unknown[]) => console.log(LOG_PREFIX.CORE, ...args),
	warn: (...args: unknown[]) => console.warn(LOG_PREFIX.CORE, ...args),
	error: (...args: unknown[]) => console.error(LOG_PREFIX.CORE, ...args),
};

export const initConfig = (filePath: string) => {
	const banword = path.join(filePath, 'banword.json');
	const banwordDefault = ['傻逼', '草拟吗', 'cnm', '死妈'];
	if (!existsSync(banword)) saveConfig(banword, banwordDefault);
};

export const isObjArrP = (send: Send, data: unknown): data is obj[] => {
	const result = isObjArr(data);
	if (!result) send(BOT_RESULT.SERVER_ERROR);
	return result;
};

export const isObjP = (send: Send, data: unknown): data is obj => {
	const result = isObj(data);
	if (!result) send(BOT_RESULT.SERVER_ERROR);
	return result;
};

export const isNotArr = (send: Send, data: unknown): data is string[] | number[] | obj[] => {
	const result = Array.isArray(data);
	if (!result) send(BOT_RESULT.SERVER_ERROR);
	return result;
};

const CACHE: obj = {};
export const CACHE_MSG_TIMES: obj<{ time: number; times: number }> = {};
export const cacheSet = (key: string, data: obj) => {
	CACHE[key] = data;
};

export const cacheGet = (key: string): obj | null => CACHE[key];

export const temp = (message: string, params: obj<string | number>) => {
	let msg = message;
	msg = stringTemp(msg, GLOBAL);
	msg = stringTemp(msg, BOT_RESULT);
	return stringTemp(msg, params);
};

export const getQq = (msg: string) => (msg ? SDK.get_at(msg) || parseInt(msg, 10) : null);

export const formatOption = (option: boolean) => (option ? BOT_RESULT.OPTION_ON : BOT_RESULT.OPTION_OFF);

export let args: string[] = [];
export const setArgs = (value: string[]) => {
	args = value;
};

let CONFIG_PLUGIN_PATH: string;
export const setPath = (value: string) => {
	CONFIG_PLUGIN_PATH = value;
};

export const loadConfigP = (filename: string, init: object = []): object => {
	const PATH = path.join(CONFIG_PLUGIN_PATH, filename);
	return (loadConfig(PATH, 'json', init) as object) || init;
};

export const saveConfigP = (filename: string, content: object) => {
	const PATH = path.join(CONFIG_PLUGIN_PATH, filename);
	return saveConfig(PATH, content);
};

export const controlParams = (filePath: string, msg: [string, string, string, string], isString: boolean = false) => {
	let message = '';
	let list = loadConfigP(filePath) as FuncStringProcessStr[];
	const target = isString ? args[2] : getQq(args[2]);
	const check = () => {
		if (!args[2]) {
			message = BOT_RESULT.ARGS_EMPTY;
			return false;
		}
		if (!target) {
			message = BOT_RESULT.ARGS_ERROR;
			return false;
		}
		return true;
	};

	let listRaw = '';
	switch (args[1]) {
		case CONTROL_PARAMS.QUERY:
			list.forEach(content => {
				listRaw += temp(msg[3], {
					content,
				});
			});
			message = temp(msg[0], {
				content: listRaw || BOT_RESULT.EMPTY,
			});
			break;
		case CONTROL_PARAMS.ADD:
			if (!check()) break;
			if (list.includes(target!)) {
				message = BOT_RESULT.EXIST;
				break;
			}
			list.push(target!);
			message = temp(msg[1], { target: target! });
			break;
		case CONTROL_PARAMS.DEL:
			if (!check()) break;
			if (!list.includes(target!)) {
				message = BOT_RESULT.NO_EXIST;
				break;
			}
			list = list.filter(item => item !== target);
			message = temp(msg[2], { target: target! });
			break;
		default:
			saveConfigP(filePath, list);
			break;
	}
	return message;
};
