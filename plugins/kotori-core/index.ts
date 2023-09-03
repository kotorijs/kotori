/*
 * @Author: hotaru biyuehuya@gmail.com
 * @Blog: http://imlolicon.tk
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

/* Public Methods */
export { fetchJ, fetchT, temp, getQq, formatOption } from './method';
export * from './class/class.cache';
export * from './class/class.core';

/* plugins Import */
export class Main extends Core {
	private Event: Event;

	public constructor(
		event: Event,
		api: Api,
		consts: Const,
		Proxy: PluginData[],
		Process: [ProcessController, ProcessController],
	) {
		super();
		/* Set variables */
		this.Event = event;
		Main.Api = api;
		Main.Const = consts;
		Main.Proxy = Proxy;
		Main.Process = Process;
		setPath(Main.Const.CONFIG_PLUGIN_PATH);
		initConfig(Main.Const.CONFIG_PLUGIN_PATH);
		this.registerEvent();
		/* Verify message from(kill bot self) */
		Main.hook(data => Content.verifyFrom(data));
		/* Run all auto events */
		Core.autoEvent.forEach(callback => callback());
	}

	private registerEvent = () => {
		this.Event.listen('on_group_msg', data => Main.onMsg(data));
		this.Event.listen('on_private_msg', data => Main.onMsg(data));
	};

	private static onMsg = (data: EventDataType) => {
		if (!Content.verifyFrom(data)) return {};
		return new Content(data, this.Api, this.Const, this.hookEvent);
	};

	public static Api: Api;

	public static Const: Const;

	public static Proxy: PluginData[];

	public static Process: [ProcessController, ProcessController];

	public static cmdDataP = this.cmdData;

	public static cmdInfoDataP = this.cmdInfoData;

	public static menuHandleParamsP = this.menuHandleParams;
}

/* Register Locale Support */
Locale.register(path.resolve(__dirname));

/* This is colorful egg */
Core.custom(
	str => stringProcess(str, 'kotori') || str.includes('kotori'),
	() => {
		const result = Main.cmdDataP.get('/menu');
		return result as string;
	},
);

Core.menu('menu', 'main').help('core.menu.main.help');
Core.menu('cores', 'coreCom').help('core.menu.corecom.help');
Core.menu('days', 'dayTool').help('core.menu.daytool.help');
Core.menu('querys', 'queryTool').help('core.menu.querytool.help');
Core.menu('funs', 'funSys').help('core.menu.funsys.help');
Core.menu('imgs', 'randomImg').help('core.menu.random_img.help');
Core.menu('other', 'otherCom').help('core.menu.othercom.help');

Core.cmd('api', async () => {
	const content = await fetchT('https://api.imlolicon.tk/sys/datastat', { format: 'text' });
	return [content ? 'core.msg.api.info' : BOT_RESULT.SERVER_ERROR, content ? { content } : { res: content }];
})
	.help('core.help.api')
	.menuId('otherCom');

const cmdCore = (keyword: string, callback: CoreVal) => {
	const result = Core.cmd(keyword, callback).menuId('coreCom');
	return result;
};

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
	.help('core.help.alias')
	.access(ACCESS.MANGER)
	.params({
		query: {
			help: 'core.help.alias.query',
		},
		add: {
			help: 'core.help.alias.add',
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
			help: 'core.help.alias.del',
			args: [
				{
					must: true,
					name: 'alias',
				},
			],
		},
	});

cmdCore('system', (send, data) => {
	if (
		!existsSync(path.join(Main.Const.ROOT_PATH, Main.Const.CONFIG.control.signserver)) ||
		!existsSync(path.join(Main.Const.ROOT_PATH, Main.Const.CONFIG.control.program))
	) {
		send('core.msg.system.fail');
		return;
	}
	const num = parseInt(Core.args[1], 10);
	const save = () => {
		saveConfig(
			path.join(Main.Const.DATA_PLUGIN_PATH, 'system.ini'),
			data.group_id ? data.group_id.toString() : 'private',
			'txt',
		);
	};
	if (!num) {
		send('core.msg.system.info.0');
		save();
		setTimeout(() => {
			Main.Process[0].restart();
		}, 2000);
	} else if (num === 1) {
		send('core.msg.system.info.1');
		save();
		setTimeout(() => {
			Main.Process[1].restart();
			Main.Process[0].restart();
		}, 2000);
	}
})
	.access(ACCESS.ADMIN)
	.params({
		'0': {
			help: 'core.help.system.0',
		},
		'1': {
			help: 'core.help.system.1',
		},
	});

cmdCore('run', (send, data) => {
	const eventData = JSON.parse(JSON.stringify(data));
	eventData.message_type = Core.args[1] as EventMessageType;
	if (eventData.message_type === 'group') eventData.group_id = parseInt(Core.args[2], 10);
	eventData.message = Core.args[3];
	send('core.msg.run', { target: Core.args[2] });
	JSON.stringify(new Content(eventData, Main.Api, Main.Const));
})
	.access(ACCESS.ADMIN)
	.params({
		private: {
			help: 'core.help.run.private',
			args: [
				{ must: true, name: 'id' },
				{ must: true, name: 'command', rest: true },
			],
		},
		group: {
			help: 'core.help.system.group',
			args: [
				{ must: true, name: 'id' },
				{ must: true, name: 'command', rest: true },
			],
		},
	});

cmdCore('locale', () => {
	const list = Object.values(LocaleIdentifier).filter(val => typeof val === 'string') as string[];
	if (Core.args[1] === 'list') {
		let listRaw = '';
		list.forEach(locale => {
			listRaw += temp('core.msg.locale.list', {
				locale,
				name: Locale.locale(`core.msg.locale.locale.${locale.toLowerCase()}`),
			});
		});
		return ['core.msg.locale.lists', { list: listRaw }];
	}
	if (Core.args[1] === 'set') {
		const locale = Core.args[2];
		if (!list.includes(locale)) return 'core.msg.locale.fail';
		const { 0: total, 1: success } = Locale.setlang(locale as keyof typeof LocaleIdentifier);
		return ['core.msg.locale.set', { locale, total, success }];
	}
	return BOT_RESULT.ARGS_ERROR;
})
	.help('core.help.locale')
	.access(ACCESS.MANGER)
	.params({
		list: {
			help: 'core.help.locale.list',
		},
		set: {
			help: 'core.help.locale.set',
			args: [
				{
					must: true,
					name: 'locales',
				},
			],
		},
	});

cmdCore('core', () => {
	const result = temp('core.msg.core.info', {
		commands: Main.cmdDataP.size,
	});
	return result;
}).help('core.help.core');

cmdCore('help', () => {
	if (!Core.args[1]) return temp('core.msg.help.info', { content: '' });
	Core.args[1] = `/${Core.args[1]}`;
	for (const key of Main.cmdInfoDataP) {
		const { 0: cmd, 1: val } = key;
		if (typeof cmd === 'string' && cmd !== Core.args[1]) continue;
		if (Array.isArray(cmd) && !cmd.includes(Core.args[1])) continue;
		if (typeof cmd === 'function') continue;
		return temp('core.msg.help.info', {
			content: Main.menuHandleParamsP(cmd, val),
		});
	}
	return 'core.msg.help.fail';
})
	.help('core.help.help')
	.params([
		{
			must: 'menu',
			name: 'command',
		},
	]);

cmdCore('view', () => {
	const { connect, control, bot } = Main.Const.CONFIG;
	const { mode, http, ws, 'ws-reverse': wsReverse } = connect;
	let modeContent = '';
	let userList = '';
	let groupList = '';
	switch (mode) {
		case 'http':
			modeContent = temp('core.msg.view.mode.http', {
				...http,
				reverse_port: http['reverse-port'],
				retry_time: http['retry-time'],
			});
			break;
		case 'ws':
			modeContent = temp('core.msg.view.mode.ws', {
				...ws,
				retry_time: ws['retry-time'],
			});
			break;
		case 'ws-reverse':
			modeContent = temp('core.msg.view.mode.wsreverse', {
				...wsReverse,
			});
			break;
	}
	const params = control.params.length > 0 ? control.params.join(' ') : BOT_RESULT.EMPTY;
	bot.users.list.forEach(content => {
		userList += temp('core.msg.view.list', { content });
	});
	bot.groups.list.forEach(content => {
		groupList += temp('core.msg.view.list', { content });
	});
	switch (bot.users.type) {
		case BotConfigFilter.BLACK:
			userList = temp('core.msg.view.user.black', {
				list: bot.users.type,
			});
			break;
		case BotConfigFilter.WHITE:
			userList = temp('core.msg.view.user.white', {
				list: userList,
			});
			break;
	}
	switch (bot.groups.type) {
		case BotConfigFilter.BLACK:
			groupList = temp('core.msg.view.group.black', {
				list: groupList,
			});
			break;
		case BotConfigFilter.WHITE:
			groupList = temp('core.msg.view.group.white', {
				list: groupList,
			});
			break;
	}

	return temp('core.msg.view.info', {
		mode: CONNECT_MODE[mode],
		mode_content: modeContent,
		...control,
		params,
		master: bot.master,
		user: formatOption(!!bot.users.type),
		group: formatOption(!!bot.groups.type),
		user_list: bot.users.type ? userList : '',
		group_list: bot.groups.type ? groupList : '',
	});
}).help('core.help.view');

cmdCore('plugin', () => {
	const pluginsJson = path.join(CONST.CONFIG_PATH, 'plugins.json');
	const data = loadConfig(pluginsJson) as string[];
	if (Core.args[1] === 'query') {
		let result = '';
		for (const element of Main.Proxy) {
			if (Core.args[2] && element[1] !== Core.args[2]) continue;
			const res = element[3] ?? {};
			res.name = res?.name ?? BOT_RESULT.EMPTY;
			res.version = res?.version ?? BOT_RESULT.EMPTY;
			res.description = res?.description ?? BOT_RESULT.EMPTY;
			res.author = res?.author ?? BOT_RESULT.EMPTY;
			res.license = res?.license ?? BOT_RESULT.EMPTY;
			result += temp('core.msg.plugin.list', {
				id: element[1],
				...res,
				state: formatOption(!data.includes(element[1])),
			});
		}
		return result
			? temp('core.msg.plugin.query', {
					num: Main.Proxy.length,
					list: result,
			  })
			: temp('core.msg.plugin.fail', {
					target: Core.args[2],
			  });
	}
	if (Core.args[1] === 'ban') {
		if (data.includes(Core.args[2])) return BOT_RESULT.EXIST;
		data.push(Core.args[2]);
		saveConfig(pluginsJson, data);
		return temp('core.msg.plugin.ban', {
			target: Core.args[2],
		});
	}
	if (Core.args[1] === 'unban') {
		if (!data.includes(Core.args[2])) return BOT_RESULT.NO_EXIST;
		saveConfig(
			pluginsJson,
			data.filter(item => item !== Core.args[2]),
		);
		return temp('core.msg.plugin.unban', {
			target: Core.args[2],
		});
	}
	return BOT_RESULT.ARGS_ERROR;
})
	.help('core.help.plugin')
	.params({
		query: {
			help: 'core.help.plugin.query',
			args: [
				{
					must: false,
					name: 'pluginId',
				},
			],
		},
		ban: {
			help: 'core.help.plugin.ban',
			args: [
				{
					must: true,
					name: 'pluginId',
				},
			],
		},
		unban: {
			help: 'core.help.plugin.unban',
			args: [
				{
					must: true,
					name: 'pluginId',
				},
			],
		},
	});

cmdCore('bot', () => {
	const { self_id: selfId, connect, status } = Main.Const.BOT;
	const STAT = status.stat;
	return temp('core.msg.bot.info', {
		self_id: selfId,
		...STAT,
		connect: formatTime(new Date(connect * 1000)),
		last_message_time: formatTime(new Date(STAT.last_message_time * 1000)),
	});
}).help('core.help.bot');

cmdCore('env', () => {
	const ENV = dealEnv();
	return temp('core.msg.env.info', { ...ENV });
}).help('core.help.env');

cmdCore('ver', () => {
	const { version, license } = getPackageInfo();
	return temp('core.msg.ver.info', { version, license });
}).help('core.help.ver');

cmdCore('status', () => {
	const { model, speed, num, rate: cpuRate } = dealCpu();
	const { total, used, rate: ramRate } = dealRam();
	return temp('core.msg.status.info', {
		type: os.type(),
		platform: os.platform(),
		arch: os.arch(),
		model,
		speed: speed.toFixed(2),
		num,
		cpu_rate: cpuRate.toFixed(2),
		total: total.toFixed(2),
		used: used.toFixed(2),
		ram_rate: ramRate.toFixed(2),
		network: Object.keys(os.networkInterfaces()).length,
		time: dealTime(),
		hostname: os.hostname(),
		homedir: os.homedir(),
	});
}).help('core.help.status');

cmdCore('about', () => {
	const { version, license } = getPackageInfo();
	return temp('core.msg.about.info', {
		version,
		license,
	});
}).help('core.help.about');

cmdCore('update', async () => {
	const { version } = getPackageInfo();
	const res = (await fetchJson('https://biyuehu.github.io/kotori-bot/package.json')) as PackageInfo;
	const content =
		res.version === version
			? 'core.msg.update.yes'
			: temp('core.msg.update.no', {
					version: res.version,
			  });
	const result = res && res.version;
	return [result ? 'core.msg.update.info' : BOT_RESULT.SERVER_ERROR, result ? { version, content } : { res }];
}).help('core.help.update');

Core.auto(() => {
	const result = loadConfig(path.join(Main.Const.DATA_PLUGIN_PATH, 'system.ini'), 'txt') as string;
	const isPrivate = result === 'private';
	const id = isPrivate ? Main.Const.CONFIG.bot.master : parseInt(result, 10);
	if (id) Main.Api.send_msg(isPrivate ? 'private' : 'group', Locale.locale('core.msg.system.info.0'), id);
	saveConfig(path.join(Main.Const.DATA_PLUGIN_PATH, 'system.ini'), '', 'txt');
});

Core.auto(async () => {
	const { version } = getPackageInfo();
	const res = (await fetch('https://biyuehu.github.io/kotori-bot/package.json')
		.then(res => res.json())
		.catch(() => console.error('Get update failed, please check your network'))) as PackageInfo;
	if (!res) {
		console.error(`Detection update failed`);
		return;
	}
	if (res.version === version) {
		console.log('Kotori-bot is currently the latest version');
		return;
	}
	console.warn(
		`The current version of Kotori-bot is ${version}, and the latest version is ${res.version}. Please go to ${GLOBAL.REPO} to update`,
	);

	Main.Api.send_private_msg(
		temp('core.msg.update.info', {
			version,
			content: temp('core.msg.update.no', {
				version: res.version,
			}),
		}),
		Main.Const.CONFIG.bot.master,
	);
});

export default Main;
