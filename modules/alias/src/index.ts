/*
 * @Author: hotaru biyuehuya@gmail.com
 * @Blog: https://hotaru.icu
 * @Date: 2023-07-11 14:18:27
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2023-09-03 17:26:30
 */
import os from 'os';
import path from 'path';
import { existsSync } from 'fs';
import type { EventDataType, Event, Api, Const, PackageInfo, PluginData, obj, EventMessageType } from '@/tools';
import {
	BotConfigFilter,
	CONNECT_MODE,
	CONST,
	Locale,
	LocaleIdentifier,
	fetchJson,
	formatTime,
	getPackageInfo,
	loadConfig,
	saveConfig,
	stringProcess,
} from '@/tools';
import ProcessController from '@/tools/class/class.process';
import {
	dealCpu,
	dealEnv,
	dealRam,
	dealTime,
	fetchT,
	formatOption,
	initConfig,
	loadConfigP,
	saveConfigP,
	setPath,
	temp,
} from './method';
import { ACCESS, BOT_RESULT, CoreVal, GLOBAL } from './type';
import Core from './class/class.core';
import Content from './class/class.content';

cmdCore('alias', () => {
	const data = loadConfigP('alias.json', {}) as obj<string>;
	if (Core.args[1] === 'query') {
		let list = '';
		Object.keys(data).forEach(key => {
			list += temp('core.msg.alias.list', {
				key,
				val: data[key],
			});
		});
		return temp('core.msg.alias.query', {
			list: list || BOT_RESULT.EMPTY,
		});
	}
	if (Core.args[1] === 'add') {
		if (data[Core.args[2]]) return BOT_RESULT.EXIST;
		Core.args[3] = `/${Core.args[3]}`;
		if (!Content.isUsefulCmd(Core.args[3].split(' ')[0], Core.args[3])) return 'core.msg.alias.fail.2';
		data[Core.args[2]] = Core.args[3];
		saveConfigP('alias.json', data);
		return temp('core.msg.alias.add', {
			input: Core.args[2],
		});
	}
	if (Core.args[1] === 'del') {
		if (!data[Core.args[2]]) return BOT_RESULT.NO_EXIST;
		delete data[Core.args[2]];
		saveConfigP('alias.json', data);
		return temp('core.msg.alias.del', {
			input: Core.args[2],
		});
	}
	return BOT_RESULT.ARGS_ERROR;
})
	.help('core.descr.alias')
	.access(ACCESS.MANGER)
	.params({
		query: {
			help: 'core.descr.alias.query',
		},
		add: {
			help: 'core.descr.alias.add',
			args: [
				{
					must: true,
					name: 'alias',
				},
				{
					must: true,
					name: 'command',
					rest: true,
				},
			],
		},
		del: {
			help: 'core.descr.alias.del',
			args: [
				{
					must: true,
					name: 'alias',
				},
			],
		},
	});
