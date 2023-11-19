/*
 * @Author: hotaru biyuehuya@gmail.com
 * @Blog: https://hotaru.icu
 * @Date: 2023-07-15 15:52:17
 * @LastEditors: hotaru biyuehuya@gmail.com
 * @LastEditTime: 2023-08-21 18:39:27
 */
import os from 'os';
import { existsSync } from 'fs';
import path from 'path';
import { version as versionTs } from 'typescript';
import { VERSION as versionTsnode } from 'ts-node';
import { Locale, fetchJson, fetchText, loadConfig, saveConfig, stringTemp } from '@/tools';
import type { FuncFetchSuper, FuncStringProcessStr, obj } from '@/tools';
import SDK from '@/utils/class.sdk';
import { BOT_RESULT, GLOBAL, URL } from './type';

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

export const initConfig = (filePath: string) => {
	const banword = path.join(filePath, 'banword.json');
	const banwordDefault = ['傻逼', '草拟吗', 'cnm', '死妈'];
	if (!existsSync(banword)) saveConfig(banword, banwordDefault);
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

export const fetchJ: FuncFetchSuper<obj> = async (url, params, init) => {
	const result = fetchJson(url.substring(0, 4) === 'http' ? url : URL.API + url, params, init);
	return result;
};

export const fetchT: FuncFetchSuper<string | void> = async (url, params, init) => {
	const result = fetchText(url.substring(0, 4) === 'http' ? url : URL.API + url, params, init);
	return result;
};

export const temp = (message: string, params: obj<string | number>) => {
	let msg = Locale.locale(message);
	msg = stringTemp(msg, GLOBAL);
	msg = stringTemp(msg, BOT_RESULT);
	return stringTemp(msg, params);
};

export const getQq = (msg: string) => (msg ? SDK.get_at(msg) || parseInt(msg, 10) : null);

export const formatOption = (option: boolean) => (option ? BOT_RESULT.OPTION_ON : BOT_RESULT.OPTION_OFF);
