/*
 * @Author: Hotaru biyuehuya@gmail.com
 * @Blog: http://imlolicon.tk
 * @Date: 2023-07-11 14:18:27
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2023-08-18 19:00:39
 */
import os from 'os';
import path from 'path';
import { existsSync } from 'fs';
import cheerio from 'cheerio';
import type { EventDataType, Event, Api, Const, PackageInfo, PluginData, obj } from '@/tools';
import {
	BotConfigFilter,
	CONNECT_MODE,
	fetchJson,
	fetchText,
	formatTime,
	getPackageInfo,
	isObj,
	isObjArr,
	loadConfig,
	saveConfig,
	stringProcess,
} from '@/tools';
import SDK from '@/utils/class.sdk';
import * as M from './method';
import * as I from './interface';
import config from './config';
import lang, { BOT_RESULT, GLOBAL } from './lang/zh_cn';
import Com, { URL, CmdInfo } from './menu';
import ProcessController from '@/tools/class/class.process';

const { apikey: CAPIKEY, group: CGROUP, component: CCOM } = config;
const { mange: CMANGE, format: CFORMAT } = CCOM;
const { menu: LMENU, auto: LAUTO, com: LCOM } = lang;

/* Public Methods */
export const { cacheGet, cacheSet, temp, getQq, formatOption } = M;
export let args: string[] = [];

/* plugins Import */
export class Main {
	public constructor(
		private Event: Event,
		Api: Api,
		Const: Const,
		Proxy: PluginData[],
		Process: [ProcessController, ProcessController],
	) {
		Main.Api = Api;
		Main.Const = Const;
		Main.Proxy = Proxy;
		Main.Process = Process;
		M.setPath(Const.CONFIG_PLUGIN_PATH);
		M.initConfig(Main.Const.CONFIG_PLUGIN_PATH);
		this.registerEvent();
		Cmd.autoEvent.forEach(callback => callback());
	}

	private registerEvent = () => {
		this.Event.listen('on_group_msg', data => Main.onMsg(data));
		this.Event.listen('on_private_msg', data => Main.onMsg(data));
		this.Event.listen('on_group_increase', data => Main.onGroupIncrease(data));
		this.Event.listen('on_group_decrease', data => Main.onGroupDecrease(data));
	};

	private static onMsg = (data: EventDataType) => {
		if (!Main.verifyFrom(data)) return {};
		return new Content(data);
	};

	private static onGroupIncrease = (data: EventDataType) => {
		if (!CMANGE.joinGroupWelcome || !Main.verifyFrom(data)) return;
		Main.Api.send_group_msg(
			temp(LAUTO.joinGroupWelcome, {
				at: SDK.cq_at(data.user_id),
			}),
			data.group_id!,
		);
	};

	private static onGroupDecrease = (data: EventDataType) => {
		if (!CMANGE.exitGroupAddBlack || !Main.verifyFrom(data)) return;
		const list = M.loadConfigP(path.join(data.group_id!.toString(), 'blackList.json')) as number[];
		list.push(data.user_id);
		M.saveConfigP(path.join(data.group_id!.toString(), 'blackList.json'), list);
		Main.Api.send_group_msg(
			temp(LAUTO.exitGroupAddBlack, {
				target: data.user_id,
			}),
			data.group_id!,
		);
	};

	public static Api: Api;

	public static Const: Const;

	public static Proxy: PluginData[];

	public static Process: [ProcessController, ProcessController];

	public static verifyEnable = (send: I.Send) => {
		const result = CMANGE.enable;
		if (!result) send(BOT_RESULT.DISABLE);
		return result;
	};

	public static verifyFrom = (data: EventDataType) => {
		if (data.message_type === 'group' && CGROUP.enable === true) {
			if (!(CGROUP.list as number[]).includes(data.group_id!)) return false;
		}
		if (data.user_id === data.self_id) return false;
		return true;
	};

	public static verifyAccess = (data: EventDataType) => {
		if (data.user_id === Main.Const.CONFIG.bot.master) return I.ACCESS.ADMIN;
		if (!data.group_id) return I.ACCESS.NORMAL;
		if (data.sender.role === 'admin' || data.sender.role === 'owner') return I.ACCESS.MANGER;
		const mangerList = M.loadConfigP(path.join(data.group_id.toString(), 'mangerList.json')) as number[];
		return mangerList.includes(data.user_id) ? I.ACCESS.MANGER : I.ACCESS.NORMAL;
	};

	public static isUsefulCmd = (
		cmd: string,
		message: string,
	): [string | I.HandlerFuncType, I.mapIndex | I.mapMatchIndex] | null => {
		const result = Com.get(cmd);
		if (result) return [result, cmd];

		for (const [key, handlerFunc] of Com) {
			if (
				typeof key !== 'string' &&
				((typeof key === 'function' && key(message)) || (Array.isArray(key) && !key.includes(message)))
			)
				return [handlerFunc, key];
		}
		return null;
	};
}

class Content {
	public constructor(private data: EventDataType) {
		if (this.data.message_type === 'group' && CMANGE.enable) this.runOtherFunc();
		M.setArgs(this.data.message.split(' '));
		args = M.args;
		const result = Main.isUsefulCmd(M.args[0], this.data.message);
		if (result) this.runHandlerFunc(...result);
		this.runAlias();
	}

	private send: I.Send = (contents, params = {}) => {
		let content = contents;
		if (typeof content === 'string') content = temp(content, params);
		if (this.data.message_type === 'private') {
			Main.Api.send_private_msg(content, this.data.user_id);
		} else {
			Main.Api.send_group_msg(content, this.data.group_id!);
		}
	};

	private checkParams = (key: I.mapIndex) => {
		const params = CmdInfo.get(key)?.params;

		if (!params) return true;
		if (Array.isArray(params)) return this.checkParamsArr(params);
		return this.checkParamsObj(params);
	};

	private checkParamsArr = (params: I.paramInfo[], num: number = 1) => {
		for (const indexs of Object.keys(params)) {
			// if (index)
			const index = parseInt(indexs, 10);
			const indexNum = index + num;
			if (params[index].rest) {
				for (let init = 0; init < M.args.length; init += 1) {
					if (init > indexNum && M.args[init]) M.args[indexNum] += ` ${M.args[init]}`;
				}
			}

			if (!M.args[indexNum] && params[index].must === true) {
				this.send(BOT_RESULT.ARGS_EMPTY);
				return false;
			}

			if (!M.args[indexNum] && typeof params[index].must === 'string') {
				M.args[indexNum] = params[index].must as string;
			}

			if (params[index].rest) return true;
		}
		return true;
	};

	private checkParamsObj = (params: I.paramInfoEx, num: number = 1) => {
		if (!M.args[num]) {
			this.send(BOT_RESULT.ARGS_ERROR);
			return false;
		}
		const result = params[M.args[num]];
		if (result === undefined) {
			this.send(BOT_RESULT.ARGS_ERROR);
			return false;
		}
		if (Array.isArray(result.args)) {
			return this.checkParamsArr(result.args, num + 1);
		}
		return true;
	};

	private checkScope = (scope: I.SCOPE) => {
		if (scope === I.SCOPE.ALL) return true;
		if (scope === I.SCOPE.PRIVATE && this.data.message_type === 'private') return true;
		if (scope === I.SCOPE.GROUP && this.data.message_type === 'group') return true;
		this.send(BOT_RESULT.MESSAGE_TYPE);
		return false;
	};

	private checkAccess = (access: I.ACCESS) => {
		const result = Main.verifyAccess(this.data) >= access;
		if (!result) this.send(access === I.ACCESS.ADMIN ? BOT_RESULT.NO_ACCESS_2 : BOT_RESULT.NO_ACCESS_1);
		return result;
	};

	private runHandlerFunc = (handlerFunc: string | I.HandlerFuncType, key: I.mapIndex | I.mapMatchIndex) => {
		if (typeof key !== 'function') {
			const cmdInfo = CmdInfo.get(key);
			if (!cmdInfo) return;
			if (!this.checkScope(cmdInfo.scope)) return;
			if (!this.checkAccess(cmdInfo.access)) return;
			if (!this.checkParams(key)) return;
		}

		if (this.data.message_type === 'group') {
			Main.Api.send_group_msg(SDK.cq_poke(this.data.user_id), this.data.group_id!);
		}
		if (typeof handlerFunc === 'string') {
			this.send(handlerFunc);
			return;
		}

		const listenr = (error: unknown) => {
			this.send(BOT_RESULT.UNKNOWN_ERROR, {
				error: error instanceof Error ? error.toString() : JSON.stringify(error),
			});
			process.removeListener('unhandledRejection', listenr);
		};
		process.on('unhandledRejection', data => listenr(data));
		const result = handlerFunc(this.send, this.data);
		if (result && typeof result === 'string') this.send(result);
	};

	private runOtherFunc = () => {
		if (Main.verifyAccess(this.data) >= I.ACCESS.MANGER) return;
		this.blackList();
		const user = this.data.user_id;
		if (
			(M.loadConfigP('whiteList.json') as number[]).includes(user) ||
			(this.data.group_id &&
				(M.loadConfigP(path.join(this.data.group_id!.toString(), 'whiteList.json')) as number[]).includes(user))
		)
			return;
		this.banword();
		this.msgTimes();
	};

	private blackList = () => {
		const user = this.data.user_id;
		const result = (M.loadConfigP(`blackList.json`) as number[]).includes(user);
		if (
			!result &&
			!(M.loadConfigP(path.join(this.data.group_id!.toString(), 'blackList.json')) as number[]).includes(user)
		)
			return true;
		Main.Api.send_group_msg(
			temp(LAUTO.existsOnBlack.info, {
				target: this.data.user_id,
				type: result ? LAUTO.existsOnBlack.type.global : LAUTO.existsOnBlack.type.local,
			}),
			this.data.group_id!,
		);
		return false;
	};

	private banword = () => {
		const banwordList = M.loadConfigP(`banword.json`) as string[];
		for (const content of banwordList) {
			if (!this.data.message.includes(content)) continue;
			Main.Api.send_group_msg(
				temp(LAUTO.bacnWord, {
					at: SDK.cq_at(this.data.user_id),
					content,
				}),
				this.data.group_id!,
			);
			Main.Api.set_group_ban(this.data.group_id!, this.data.user_id, CMANGE.banwordBanTime);
			Main.Api.delete_msg(this.data.message_id);
		}
	};

	private msgTimes = () => {
		const user = this.data.group_id! + this.data.user_id;
		if (
			!M.CACHE_MSG_TIMES[user] ||
			M.CACHE_MSG_TIMES[user].time + CMANGE.repeatRule.cycleTime * 1000 < new Date().getTime()
		) {
			M.CACHE_MSG_TIMES[user] = {
				time: new Date().getTime(),
				times: 1,
			};
			return;
		}
		if (M.CACHE_MSG_TIMES[user].times > CMANGE.repeatRule.maxTimes) {
			Main.Api.set_group_ban(this.data.group_id!, this.data.user_id, CMANGE.repeatBanTime);
			Main.Api.send_group_msg(
				temp(LAUTO.msgTimes, {
					at: SDK.cq_at(this.data.user_id),
				}),
				this.data.group_id!,
			);
			return;
		}
		M.CACHE_MSG_TIMES[user].times += 1;
	};

	private runAlias = () => {
		const data = (M.loadConfigP('alias.json', {}) as obj<string>)[this.data.message];
		if (!data || typeof data !== 'string') return;
		this.data.message = data;
		JSON.stringify(new Content(this.data));
	};
}

export class Cmd {
	private static initialize = () => {
		this.isInitialize = true;
		if (CCOM.mainMenu) {
			Cmd.register(
				LMENU.mainMenu.cmd,
				undefined,
				undefined,
				I.SCOPE.ALL,
				I.ACCESS.NORMAL,
				LMENU.mainMenu.content,
			);
		}
		for (const key of Object.keys(LMENU.customMenu)) {
			const menu = (LMENU.customMenu as I.customMenu)[key];
			if (!menu.cmd || !menu.content) continue;
			this.register(
				menu.cmd,
				undefined,
				undefined,
				menu.scope ?? I.SCOPE.ALL,
				menu.access ?? I.ACCESS.NORMAL,
				menu.content,
			);
		}
	};

	public static menu = (
		keyword: string | string[],
		menuId: string,
		scope: I.SCOPE = I.SCOPE.ALL,
		access: I.ACCESS = I.ACCESS.NORMAL,
	) => {
		const callback = () => this.menuHandle(menuId);
		this.register(keyword, undefined, undefined, scope, access, callback);
	};

	public static register = (
		keyword: string | string[],
		description: string | undefined,
		menuId: string | undefined,
		scope: I.SCOPE,
		access: I.ACCESS,
		callback: I.HandlerFuncType | string,
		params?: I.paramInfo[] | I.paramInfoEx,
	) => {
		if (!this.isInitialize) this.initialize();
		Com.set(keyword, callback);
		CmdInfo.set(keyword, { menuId, description, scope, access, params });
	};

	public static registerCustom = (match: I.mapMatchIndex, callback: I.HandlerFuncType | string) => {
		if (!this.isInitialize) this.initialize();
		Com.set(match, callback);
	};

	public static autoEvent: (() => void)[] = [];

	public static auto = (callback: () => void) => {
		this.autoEvent.push(callback);
	};

	private static isInitialize: boolean = false;

	private static menuHandle = (menuId: string) => {
		let list = '';
		for (const key of CmdInfo) {
			const { 0: cmdKey, 1: value } = key;
			if (value.menuId !== menuId || typeof cmdKey === 'function') continue;
			list += this.menuHandleParams(cmdKey, value);
		}
		list = temp(LMENU.sonMenu.info, {
			list,
		});
		return list;
	};

	public static menuHandleParams = (key: I.mapIndex, value: I.cmdVal) => {
		const cmdName = Array.isArray(key) ? key[0] : key;
		let scope = '';
		if (value.scope !== I.SCOPE.ALL) {
			scope = value.scope === I.SCOPE.GROUP ? LMENU.sonMenu.scopeGroup : LMENU.sonMenu.scopePrivate;
		}
		let access = '';
		if (value.access !== I.ACCESS.NORMAL) {
			access = value.access === I.ACCESS.MANGER ? LMENU.sonMenu.accessManger : LMENU.sonMenu.accessAdmin;
		}
		let list = '';
		let handleParams = '';

		/* type = paramInfo[] */
		if (Array.isArray(value.params) || !value.params) {
			if (value.params) handleParams = this.menuHandleParamsArr(value.params);
			return temp(LMENU.sonMenu.list, {
				name: cmdName,
				param: handleParams,
				descr: value.description
					? temp(LMENU.sonMenu.descr, {
							content: value.description,
					  })
					: '',
				scope,
				access,
			});
		}

		/* type = paramInfoEx */
		for (const param of Object.keys(value.params)) {
			handleParams = '';
			const val = (value.params as I.paramInfoEx)[param];
			if (Array.isArray(val.args)) handleParams += this.menuHandleParamsArr(val.args);
			list += temp(LMENU.sonMenu.list, {
				name: `${cmdName} ${param}`,
				param: handleParams,
				descr: val.descr
					? temp(LMENU.sonMenu.descr, {
							content: val.descr,
					  })
					: '',
				scope,
				access,
			});
		}
		return list;
	};

	private static menuHandleParamsArr = (params: I.paramInfo[]) => {
		let handleParams = '';
		params.forEach(element => {
			const paramName = element.name ?? LMENU.sonMenu.paramNameDefault;
			const prefix = element.rest ? '...' : '';
			let suffix = '';
			if (!element.must) {
				suffix =
					element.must === false
						? LMENU.sonMenu.suffixOptional
						: temp(LMENU.sonMenu.suffixDefault, {
								content: element.must,
						  });
			}
			handleParams += temp(LMENU.sonMenu.param, {
				param_name: paramName,
				prefix,
				suffix,
			});
		});
		return handleParams;
	};
}

/* Menus */
Cmd.menu(LMENU.sonMenu.names.dayTool, 'dayTool');
Cmd.menu(LMENU.sonMenu.names.queryTool, 'queryTool');
Cmd.menu(LMENU.sonMenu.names.randomImg, 'randomImg');
Cmd.menu(LMENU.sonMenu.names.gptChat, 'gptChat');
Cmd.menu(LMENU.sonMenu.names.funSys, 'funSys');
if (CMANGE.enable) Cmd.menu(LMENU.sonMenu.names.groupMange, 'groupMange', I.SCOPE.GROUP, I.ACCESS.MANGER);
Cmd.menu(LMENU.sonMenu.names.superMange, 'superMange', I.SCOPE.ALL, I.ACCESS.NORMAL);
Cmd.menu(LMENU.sonMenu.names.specialCom, 'specialCom');
Cmd.menu(LMENU.sonMenu.names.aboutInfo, 'aboutInfo');

Cmd.registerCustom(
	str => stringProcess(str, 'kotori') || str.includes('kotori'),
	() => {
		const result = Com.get(LMENU.mainMenu.cmd);
		return result as string;
	},
);

/* Components */
/* dayTool */
Cmd.register(
	LCOM.music.cmd,
	LCOM.music.descr,
	'dayTool',
	I.SCOPE.ALL,
	I.ACCESS.NORMAL,
	async send => {
		const cache = `music${M.args[1]}`;
		const res = cacheGet(cache) || (await M.fetchJ('netease', { name: M.args[1] }));
		if (!M.isObjP(send, res) || !M.isObjArrP(send, res.data)) return;
		cacheSet(cache, res);
		if (res.code === I.RES_CODE.ARGS_ERROR) {
			send(LCOM.music.fail, {
				input: M.args[1],
			});
			return;
		}

		const num = parseInt(M.args[2], 10);
		if (num === 0) {
			let list = '';
			for (
				let init = 0;
				init < (res.data.length > CFORMAT.maxListNums ? CFORMAT.maxListNums : res.data.length);
				init += 1
			) {
				const song = res.data[init];
				list += temp(LCOM.music.list, {
					num: init + 1,
					title: typeof song.title === 'string' ? song.title : BOT_RESULT.EMPTY,
					author: typeof song.author === 'string' ? song.author : BOT_RESULT.EMPTY,
				});
			}
			send(LCOM.music.listInfo, {
				list,
			});
			return;
		}

		const song = res.data[num - 1];
		if (!song) {
			send(BOT_RESULT.NUM_ERROR);
			return;
		}

		send(LCOM.music.info, {
			...song,
			image: typeof song.pic === 'string' ? SDK.cq_image(song.pic) : BOT_RESULT.EMPTY,
		});
		if (typeof song.songid === 'string') send(SDK.cq_Music('163', song.songid));
	},
	[
		{
			must: true,
			name: LCOM.music.args[0],
		},
		{
			must: '1',
			name: LCOM.music.args[0],
		},
	],
);

Cmd.register(
	LCOM.bgm.cmd,
	LCOM.bgm.descr,
	'dayTool',
	I.SCOPE.ALL,
	I.ACCESS.NORMAL,
	async send => {
		const num = parseInt(M.args[2], 10);
		const cache = `bgm${M.args[1]}`;
		const res =
			cacheGet(cache) ||
			(await M.fetchBGM(`search/subject/${M.args[1]}`, {
				token: CAPIKEY.bangumi,
			}));
		if (!res || !isObjArr(res.list)) {
			send(LCOM.bgm.fail, {
				input: M.args[1],
			});
			return;
		}
		cacheSet(cache, res);

		if (num === 0) {
			let list = '';
			for (
				let init = 0;
				init < (res.list.length > CFORMAT.maxListNums ? CFORMAT.maxListNums : res.list.length);
				init += 1
			) {
				const data = res.list[init];
				list += temp(LCOM.bgm.list, {
					...data,
					num: init + 1,
				});
			}
			send(LCOM.bgm.listInfo, {
				list,
			});
			return;
		}

		const data = res.list[num - 1];
		if (!data) {
			send(BOT_RESULT.NUM_ERROR);
			return;
		}

		const res2 = await M.fetchBGM(`v0/subjects/${data.id}`, {
			token: CAPIKEY.bangumi,
		});
		if (!Array.isArray(res2.tags)) {
			send(LCOM.bgm.fail);
			return;
		}

		let tags = '';
		res2.tags.forEach((data: { name: string; count: number }) => {
			tags += `、${data.name}`;
		});
		send(LCOM.bgm.info, {
			...res2,
			tags: tags.substring(1),
			url: `https://bgm.tv/subject/${data.id}`,
			image:
				isObj(res2.images) && typeof res2.images.large === 'string'
					? SDK.cq_image(res2.images.large)
					: BOT_RESULT.EMPTY,
		});
	},
	[
		{
			must: true,
			name: LCOM.bgm.args[0],
		},
		{
			must: '1',
			name: LCOM.bgm.args[0],
		},
	],
);

Cmd.register(LCOM.bgmc.cmd, LCOM.bgmc.descr, 'dayTool', I.SCOPE.ALL, I.ACCESS.NORMAL, async send => {
	const res = await M.fetchBGM(`calendar`, { token: CAPIKEY.bangumi });
	if (!M.isObjP(send, res) || !M.isObjArrP(send, res)) return;

	const dayNum = (() => {
		const day = new Date().getDay();
		return day === 0 ? 6 : day - 1;
	})();
	const { items } = res[dayNum];
	if (!Array.isArray(items)) {
		send(BOT_RESULT.SERVER_ERROR);
		return;
	}
	let list = '';
	for (let init = 0; init < 3; init += 1) {
		const item = items[init];
		if (!M.isObjP(send, item)) return;
		list += temp(LCOM.bgmc.list, {
			...item,
			image:
				isObj(item.images) && typeof item.images.large === 'string'
					? SDK.cq_image(item.images.large)
					: BOT_RESULT.EMPTY,
		});
	}
	send(LCOM.bgmc.info, {
		weekday: isObj(res[dayNum].weekday) ? ((res[dayNum].weekday as obj).ja as string) : BOT_RESULT.EMPTY,
		list,
	});
});

Cmd.register(
	LCOM.star.cmd,
	LCOM.star.descr,
	'dayTool',
	I.SCOPE.ALL,
	I.ACCESS.NORMAL,
	async send => {
		const res = await M.fetchJ('starluck', { msg: M.args[1] });
		if (!M.isObjP(send, res) || !M.isObjP(send, res.data) || M.isNotArr(send, res.data)) return;
		if (res.code === I.RES_CODE.ARGS_EMPTY) {
			send(LCOM.star.fail, {
				input: M.args[1],
			});
			return;
		}

		if (!Array.isArray(res.data.info) || !Array.isArray(res.data.index)) {
			send(BOT_RESULT.SERVER_ERROR);
			return;
		}

		let list = '';
		res.data.info.forEach((content: string) => {
			list += temp(LCOM.star.list, {
				content,
			});
		});
		res.data.index.forEach((content: string) => {
			list += temp(LCOM.star.list, {
				content,
			});
		});
		send(LCOM.star.info, {
			input: M.args[1],
			list,
		});
	},
	[
		{
			must: true,
			name: LCOM.star.args[0],
		},
	],
);

Cmd.register(
	LCOM.tran.cmd,
	LCOM.tran.descr,
	'dayTool',
	I.SCOPE.ALL,
	I.ACCESS.NORMAL,
	async send => {
		const res = await M.fetchJ('fanyi', { msg: M.args[1] });
		send(
			res && res.code === I.RES_CODE.SUCCESS && typeof res.data === 'string'
				? temp(LCOM.tran.info, {
						input: M.args[1],
						content: res.data,
				  })
				: BOT_RESULT.SERVER_ERROR,
		);
	},
	[
		{
			must: true,
			name: LCOM.tran.args[0],
			rest: true,
		},
	],
);

Cmd.register(LCOM.lunar.cmd, LCOM.lunar.descr, 'dayTool', I.SCOPE.ALL, I.ACCESS.NORMAL, async send => {
	const res = await M.fetchT('lunar');
	send(
		res
			? temp(LCOM.lunar.info, {
					content: res,
			  })
			: BOT_RESULT.SERVER_ERROR,
	);
});

Cmd.register(LCOM.story.cmd, LCOM.story.descr, 'dayTool', I.SCOPE.ALL, I.ACCESS.NORMAL, async send => {
	const res = await M.fetchJ('storytoday');
	if (!res || res.code !== I.RES_CODE.SUCCESS || !Array.isArray(res.data)) {
		send(BOT_RESULT.SERVER_ERROR);
		return;
	}

	let list = '';
	(res.data as string[]).forEach(content => {
		list += temp(LCOM.story.list, {
			content,
		});
	});
	send(LCOM.story.info, {
		list,
	});
});

Cmd.register(
	LCOM.luck.cmd,
	LCOM.luck.descr,
	'dayTool',
	I.SCOPE.ALL,
	I.ACCESS.NORMAL,
	async (send, data) => {
		const target = getQq(M.args[1]) || data.user_id;
		M.fetchT(
			'https://m.smxs.com/qq',
			{},
			{
				headers: {
					'content-type': 'application/x-www-form-urlencoded',
				},
				body: `submit=1&qq=${target}`,
				method: 'POST',
			},
		)
			.then(body => {
				if (!body) {
					send(BOT_RESULT.SERVER_ERROR);
					return;
				}
				const $ = cheerio.load(body);
				let luck = $('.subs_main font').text() ?? '';
				luck = luck ? `${luck.split('(')[0]} ${luck.split(')')[1] || ''}` : '';
				const character = $('.subs_main').find('p:eq(4)').text().split('：')[1] ?? '';
				const characterScore = $('.subs_main').find('p:eq(5)').text().split('：')[1] ?? '';
				send(LCOM.luck.info, {
					input: target,
					luck,
					character,
					character_score: characterScore,
				});
			})
			.catch(() => {
				send(BOT_RESULT.SERVER_ERROR);
			});
	},
	[
		{
			must: false,
			name: LCOM.luck.args[0],
		},
	],
);

Cmd.register(
	LCOM.value.cmd,
	LCOM.value.descr,
	'dayTool',
	I.SCOPE.ALL,
	I.ACCESS.NORMAL,
	async (send, data) => {
		const target = getQq(M.args[1]) || data.user_id;
		send(LCOM.value.info, {
			image: SDK.cq_image(`https://c.bmcx.com/temp/qqjiazhi/${target}.jpg`),
		});
	},
	[
		{
			must: false,
			name: LCOM.value.args[0],
		},
	],
);

Cmd.register(
	LCOM.weather.cmd,
	LCOM.weather.descr,
	'dayTool',
	I.SCOPE.ALL,
	I.ACCESS.NORMAL,
	async send => {
		const res = await M.fetchT('weather', { msg: M.args[1], b: 1 });
		send(
			res
				? temp(LCOM.weather.info, {
						content: res,
				  })
				: BOT_RESULT.SERVER_ERROR,
		);
	},
	[
		{
			must: true,
			name: LCOM.weather.args[0],
		},
	],
);

Cmd.register(
	LCOM.waste.cmd,
	LCOM.waste.descr,
	'dayTool',
	I.SCOPE.ALL,
	I.ACCESS.NORMAL,
	async send => {
		const res = await M.fetchJ(
			'https://api.toolnb.com/Tools/Api/lajifenlei.html',
			{},
			{
				headers: {
					'content-type': 'application/x-www-form-urlencoded',
				},
				body: `input=${M.args[1]}`,
				method: 'POST',
			},
		);
		if (!res || res.msg !== 'ok' || !Array.isArray(res.data) || !isObj(res.data[0])) {
			send(BOT_RESULT.SERVER_ERROR);
			return;
		}
		const type = LCOM.waste.key[res.data[0].type === 'string' ? parseInt(res.data[0].type, 10) : 0];
		send(LCOM.waste.info, {
			input: M.args[1],
			type,
		});
	},
	[
		{
			must: true,
			name: LCOM.waste.args[0],
		},
	],
);

/* queryTool */
Cmd.register(
	LCOM.github.cmd,
	LCOM.github.descr,
	'queryTool',
	I.SCOPE.ALL,
	I.ACCESS.NORMAL,
	async send => {
		const res = await M.fetchJ(`https://api.github.com/repos/${M.args[1]}`);
		if (!M.isObjP(send, res)) return;
		if (!res.full_name) {
			send(LCOM.github.fail, {
				input: M.args[1],
			});
			return;
		}
		send(LCOM.github.info, {
			name: res.full_name || BOT_RESULT.EMPTY,
			description: res.description || BOT_RESULT.EMPTY,
			language: res.language || BOT_RESULT.EMPTY,
			author: res.owner ? res.owner.login || BOT_RESULT.EMPTY : BOT_RESULT.EMPTY,
			create: res.created_at || BOT_RESULT.EMPTY,
			update: res.updated_at || BOT_RESULT.EMPTY,
			push: res.pushed_at || BOT_RESULT.EMPTY,
			license: res.license ? res.license.name || BOT_RESULT.EMPTY : BOT_RESULT.EMPTY,
		});
		send(
			SDK.cq_image(
				`https://opengraph.githubassets.com/c9f4179f4d560950b2355c82aa2b7750bffd945744f9b8ea3f93cc24779745a0/${res.full_name}`,
			),
		);
	},
	[
		{
			must: true,
			name: LCOM.github.args[0],
		},
	],
);

Cmd.register(
	LCOM.motd.cmd,
	LCOM.motd.descr,
	'queryTool',
	I.SCOPE.ALL,
	I.ACCESS.NORMAL,
	async send => {
		const res = await M.fetchJ('motd', { ip: M.args[1], port: M.args[2] });
		if (!M.isObjP(send, res) || !M.isObjP(send, res.data) || M.isNotArr(send, res.data)) return;
		if (res.code !== I.RES_CODE.SUCCESS && typeof res.code === 'number') {
			send(LCOM.motd.fail, {
				ip: M.args[1],
				port: M.args[2],
			});
			return;
		}

		send(LCOM.motd.info, {
			...res.data,
			image:
				typeof res.data.icon === 'string'
					? SDK.cq_image(`base64://${res.data.icon.substring(22)}`)
					: BOT_RESULT.EMPTY,
		});
	},
	[
		{
			must: true,
			name: LCOM.motd.args[0],
		},
		{
			must: '25565',
			name: LCOM.motd.args[1],
		},
	],
);

Cmd.register(
	LCOM.motdbe.cmd,
	LCOM.motdbe.descr,
	'queryTool',
	I.SCOPE.ALL,
	I.ACCESS.NORMAL,
	async send => {
		const res = await M.fetchJ('motdpe', {
			ip: M.args[1],
			port: M.args[2],
		});
		if (!M.isObjP(send, res) || !M.isObjP(send, res.data) || M.isNotArr(send, res.data)) return;
		if (res.code !== I.RES_CODE.SUCCESS && typeof res.code === 'number') {
			send(LCOM.motdbe.fail, {
				ip: M.args[1],
				port: M.args[2],
			});
			return;
		}

		send(LCOM.motdbe.info, {
			...res.data,
		});
	},
	[
		{
			must: true,
			name: LCOM.motdbe.args[0],
		},
		{
			must: '19132',
			name: LCOM.motdbe.args[1],
		},
	],
);

Cmd.register(
	LCOM.mcskin.cmd,
	LCOM.mcskin.descr,
	'queryTool',
	I.SCOPE.ALL,
	I.ACCESS.NORMAL,
	async send => {
		const res = await M.fetchJ('mcskin', { name: M.args[1] });
		if (!M.isObjP(send, res) || !M.isObjP(send, res.data) || M.isNotArr(send, res.data)) return;
		if (res.code === I.RES_CODE.ARGS_ERROR) {
			send(LCOM.mcskin.fail, {
				input: M.args[1],
			});
			return;
		}

		send(LCOM.mcskin.info, {
			input: M.args[1],
			skin: SDK.cq_image(res.data.skin),
			cape: res.data.cape ? SDK.cq_image(res.data.cape) : BOT_RESULT.EMPTY,
			avatar: res.data.avatar ? SDK.cq_image(`base64://${res.data.avatar.substring(22)}`) : BOT_RESULT.EMPTY,
		});
	},
	[
		{
			must: true,
			name: LCOM.mcskin.args[0],
		},
	],
);

Cmd.register(
	LCOM.bili.cmd,
	LCOM.bili.descr,
	'queryTool',
	I.SCOPE.ALL,
	I.ACCESS.NORMAL,
	async send => {
		const res = await M.fetchJ('biligetv', { msg: M.args[1] });
		if (!M.isObjP(send, res) || !M.isObjP(send, res.data) || M.isNotArr(send, res.data)) return;
		if (res.code !== I.RES_CODE.SUCCESS && typeof res.code === 'number') {
			send(LCOM.bili.fail, {
				input: M.args[1],
			});
			return;
		}

		send(LCOM.bili.info, {
			...res.data,
			owner: res.data.owner.uid,
			image: SDK.cq_image(res.data.pic),
		});
	},
	[
		{
			must: true,
			name: LCOM.bili.args[0],
		},
	],
);

Cmd.register(
	LCOM.sed.cmd,
	LCOM.sed.descr,
	'queryTool',
	I.SCOPE.ALL,
	I.ACCESS.NORMAL,
	async (send, data) => {
		if (M.args[1] === data.self_id.toString()) {
			send(LCOM.sed.fail, {
				input: M.args[1],
			});
			return;
		}

		const res = await M.fetchJ('sed', { msg: M.args[1] });
		if (!M.isObjP(send, res) || !M.isObjP(send, res.data) || M.isNotArr(send, res.data)) return;
		if (res.code === I.RES_CODE.ARGS_EMPTY) {
			send(LCOM.sed.fail, {
				input: M.args[1],
			});
			return;
		}

		send(LCOM.sed.info, {
			input: M.args[1],
			time: Math.floor(res.takeTime),
			count: res.count,
			list:
				(res.data.qq
					? temp(LCOM.sed.list, {
							key: LCOM.sed.key.qq,
							content: res.data.qq,
					  })
					: '') +
				(res.data.phone
					? temp(LCOM.sed.list, {
							key: LCOM.sed.key.phone,
							content: res.data.phone,
					  })
					: '') +
				(res.data.location
					? temp(LCOM.sed.list, {
							key: LCOM.sed.key.location,
							content: res.data.location,
					  })
					: '') +
				(res.data.id
					? temp(LCOM.sed.list, {
							key: LCOM.sed.key.id,
							content: res.data.id,
					  })
					: '') +
				(res.data.area
					? temp(LCOM.sed.list, {
							key: LCOM.sed.key.area,
							content: res.data.area,
					  })
					: ''),
		});
	},
	[
		{
			must: true,
			name: LCOM.sed.args[0],
		},
	],
);

Cmd.register(
	LCOM.idcard.cmd,
	LCOM.idcard.descr,
	'queryTool',
	I.SCOPE.ALL,
	I.ACCESS.NORMAL,
	async send => {
		const res = await M.fetchJ('idcard', { msg: M.args[1] });
		if (!M.isObjP(send, res) || !M.isObjP(send, res.data) || M.isNotArr(send, res.data)) return;
		if (res.code === I.RES_CODE.ARGS_EMPTY) {
			send(LCOM.idcard.fail, {
				input: M.args[1],
			});
			return;
		}

		send(LCOM.idcard.info, {
			input: M.args[1],
			...res.data,
		});
	},
	[
		{
			must: true,
			name: LCOM.idcard.args[0],
		},
	],
);

Cmd.register(
	LCOM.hcb.cmd,
	LCOM.hcb.descr,
	'queryTool',
	I.SCOPE.ALL,
	I.ACCESS.NORMAL,
	async send => {
		const res = await M.fetchJ('https://hcb.imlolicon.tk/api/v3', {
			value: M.args[1],
		});
		if (!res || res.code !== I.RES_CODE.SUCCESS || !isObj(res.data) || Array.isArray(res.data)) {
			send(BOT_RESULT.SERVER_ERROR);
			return;
		}

		if (!res.data.status) {
			send(LCOM.hcb.fail, {
				input: M.args[1],
			});
			return;
		}

		let imgs = '';
		if (res.data.imgs !== null) {
			(<string[]>res.data.imgs).forEach(element => {
				imgs += SDK.cq_image(element);
			});
		}
		send(LCOM.hcb.info, {
			input: M.args[1],
			...res.data,
			images: imgs || BOT_RESULT.EMPTY,
		});
	},
	[
		{
			must: true,
			name: LCOM.hcb.args[0],
		},
	],
);

Cmd.register(
	LCOM.header.cmd,
	LCOM.header.descr,
	'queryTool',
	I.SCOPE.ALL,
	I.ACCESS.NORMAL,
	async send => {
		const res = await fetchText(M.args[1]);
		if (!res) {
			send(BOT_RESULT.ARGS_ERROR);
			return;
		}
		const $ = cheerio.load(res);

		let image = $('link[rel="icon"]').attr('href');
		image = image || $(/* html */ `link[rel="shortcut icon"]`).attr('href');
		const domain = M.args[1].match(/^https?:\/\/([^/]+)/i);
		if (image) {
			image = image.includes('http')
				? image
				: `http://${Array.isArray(domain) ? domain[1] : ''}${image.substring(0, 1) === '/' ? '' : '/'}${image}`;
		} else {
			image = '';
		}
		const title = $('title').text() ?? BOT_RESULT.EMPTY;
		const keywords = $('meta[name="keywords"]').attr('content') ?? BOT_RESULT.EMPTY;
		const description = $('meta[name="description"]').attr('content') ?? BOT_RESULT.EMPTY;
		send(LCOM.header.info, {
			input: M.args[1],
			title,
			keywords,
			description,
			image: image ? SDK.cq_image(image) : BOT_RESULT.EMPTY,
		});
	},
	[
		{
			must: true,
			name: LCOM.header.args[0],
		},
	],
);

Cmd.register(
	LCOM.state.cmd,
	LCOM.state.descr,
	'queryTool',
	I.SCOPE.ALL,
	I.ACCESS.NORMAL,
	async send => {
		const res = await M.fetchT('webtool', { op: 1, url: M.args[1] });
		send(
			res
				? temp(LCOM.state.info, {
						content: res.replace(/<br>/g, '\n'),
				  })
				: BOT_RESULT.SERVER_ERROR,
		);
	},
	[
		{
			must: true,
			name: LCOM.state.args[0],
		},
	],
);

Cmd.register(
	LCOM.speed.cmd,
	LCOM.speed.descr,
	'queryTool',
	I.SCOPE.ALL,
	I.ACCESS.NORMAL,
	async send => {
		const res = await M.fetchT('webtool', { op: 3, url: M.args[1] });
		send(
			res
				? temp(LCOM.speed.info, {
						content: res.replace(/<br>/g, '\n'),
				  })
				: BOT_RESULT.SERVER_ERROR,
		);
	},
	[
		{
			must: true,
			name: LCOM.speed.args[0],
		},
	],
);

/* randomImg */
Cmd.register(
	LCOM.sex.cmd,
	LCOM.sex.descr,
	'randomImg',
	I.SCOPE.ALL,
	I.ACCESS.NORMAL,
	async send => {
		send(LCOM.sex.tips);

		const res = await M.fetchJ(`${URL.BLOG}seimg/v2/`, { tag: M.args[1], r18: 0 });
		if (!M.isObjP(send, res) || !M.isObjArrP(send, res.data)) return;
		if (res.code === I.RES_CODE.ARGS_EMPTY) {
			send(LCOM.sex.fail, {
				input: M.args[1],
			});
			return;
		}

		const dd = res.data[0];
		let tags = '';
		dd.tags.forEach((element: string) => {
			tags += `、${element}`;
		});
		send(LCOM.sex.info, {
			...dd,
			tags: tags.substring(1),
		});
		send(LCOM.sex.image, {
			image: SDK.cq_image(dd.url),
		});
	},
	[
		{
			must: '',
			name: LCOM.sex.args[0],
		},
	],
);

Cmd.register(
	LCOM.sexh.cmd,
	LCOM.sexh.descr,
	'randomImg',
	I.SCOPE.ALL,
	I.ACCESS.NORMAL,
	async send => {
		send(LCOM.sexh.tips);
		const res = await M.fetchJ(`${URL.BLOG}huimg/`, { tag: M.args[1] });
		if (!res || res.code === I.RES_CODE.ARGS_EMPTY) {
			send(LCOM.sexh.fail, {
				input: M.args[1],
			});
			return;
		}
		if (!M.isObjP(send, res.data) || M.isNotArr(send, res.data)) return;

		const dd = res.data;
		let tags = '';
		(<string[]>dd.tag).forEach(element => {
			tags += `、${element}`;
		});
		send(LCOM.sexh.info, {
			tags: tags.substring(1),
			image: SDK.cq_image(dd.url),
		});
	},
	[
		{
			must: false,
			name: LCOM.sexh.args[0],
		},
	],
);

Cmd.register(LCOM.seller.cmd, LCOM.seller.descr, 'randomImg', I.SCOPE.ALL, I.ACCESS.NORMAL, () =>
	temp(LCOM.seller.info, {
		image: SDK.cq_image(`${URL.API}sellerimg`),
	}),
);

Cmd.register(LCOM.sedimg.cmd, LCOM.sedimg.descr, 'randomImg', I.SCOPE.ALL, I.ACCESS.NORMAL, () =>
	temp(LCOM.sedimg.info, {
		image: SDK.cq_image(`${URL.API}sedimg`),
	}),
);

Cmd.register(LCOM.bing.cmd, LCOM.bing.descr, 'randomImg', I.SCOPE.ALL, I.ACCESS.NORMAL, () =>
	temp(LCOM.bing.info, {
		image: SDK.cq_image(`${URL.API}bing`),
	}),
);

Cmd.register(LCOM.day.cmd, LCOM.day.descr, 'randomImg', I.SCOPE.ALL, I.ACCESS.NORMAL, () =>
	CAPIKEY.api.day
		? temp(LCOM.day.info, {
				image: SDK.cq_image(`${URL.API}60s?apikey=${CAPIKEY.api.day}&area=日本神户市`),
		  })
		: BOT_RESULT.APIKEY_EMPTY,
);

Cmd.register(LCOM.earth.cmd, LCOM.earth.descr, 'randomImg', I.SCOPE.ALL, I.ACCESS.NORMAL, () =>
	temp(LCOM.earth.info, {
		image: SDK.cq_image('https://img.nsmc.org.cn/CLOUDIMAGE/FY4A/MTCC/FY4A_DISK.jpg'),
	}),
);

Cmd.register(LCOM.china.cmd, LCOM.china.descr, 'randomImg', I.SCOPE.ALL, I.ACCESS.NORMAL, () =>
	temp(LCOM.china.info, {
		image: SDK.cq_image('https://img.nsmc.org.cn/CLOUDIMAGE/FY4A/MTCC/FY4A_CHINA.jpg'),
	}),
);

Cmd.register(LCOM.sister.cmd, LCOM.sister.descr, undefined, I.SCOPE.ALL, I.ACCESS.NORMAL, () =>
	temp(LCOM.sister.info, {
		video: SDK.cq_video(`${URL.API}sisters`),
	}),
);

Cmd.register(
	LCOM.qrcode.cmd,
	LCOM.qrcode.descr,
	'randomImg',
	I.SCOPE.ALL,
	I.ACCESS.NORMAL,
	() => {
		const frame = ['L', 'M', 'Q', 'H'][parseInt(M.args[2], 10)];
		if (!frame) {
			return BOT_RESULT.ARGS_ERROR;
		}
		return temp(LCOM.qrcode.info, {
			image: SDK.cq_image(`${URL.API}qrcode?text=${M.args[1]}&frame=2&size=200&e=${frame}`),
		});
	},
	[
		{
			must: true,
			name: LCOM.qrcode.args[0],
		},
		{
			must: '3',
			name: LCOM.qrcode.args[1],
		},
	],
);

/* hitokotoList */
Cmd.register(LCOM.hitokoto.cmd, undefined, undefined, I.SCOPE.ALL, I.ACCESS.NORMAL, async send => {
	const res = await M.fetchJ(`${URL.BLOG}hitokoto/v2/`, undefined);
	if (!M.isObjP(send, res.data) || M.isNotArr(send, res.data)) return;

	send(LCOM.hitokoto.info, {
		...res.data,
		from: res.data.from ? `——${res.data.from}` : '',
	});
});

const hitokotoT = (msg: number) => M.fetchT('words', { msg, format: 'text' });
Cmd.register(LCOM.hitokotoList.cmd[0], undefined, undefined, I.SCOPE.ALL, I.ACCESS.NORMAL, async send => {
	const res = await hitokotoT(1);
	send(
		res
			? temp(LCOM.hitokotoList.info, {
					content: res,
			  })
			: BOT_RESULT.SERVER_ERROR,
	);
});

Cmd.register(LCOM.hitokotoList.cmd[1], undefined, undefined, I.SCOPE.ALL, I.ACCESS.NORMAL, async send => {
	const res = await hitokotoT(2);
	send(
		res
			? temp(LCOM.hitokotoList.info, {
					content: res,
			  })
			: BOT_RESULT.SERVER_ERROR,
	);
});

Cmd.register(LCOM.hitokotoList.cmd[2], undefined, undefined, I.SCOPE.ALL, I.ACCESS.NORMAL, async send => {
	const res = await hitokotoT(3);
	send(
		res
			? temp(LCOM.hitokotoList.info, {
					content: res,
			  })
			: BOT_RESULT.SERVER_ERROR,
	);
});

Cmd.register(LCOM.hitokotoList.cmd[3], undefined, undefined, I.SCOPE.ALL, I.ACCESS.NORMAL, async send => {
	const res = await hitokotoT(4);
	send(
		res
			? temp(LCOM.hitokotoList.info, {
					content: res,
			  })
			: BOT_RESULT.SERVER_ERROR,
	);
});

Cmd.register(LCOM.hitokotoList.cmd[4], undefined, undefined, I.SCOPE.ALL, I.ACCESS.NORMAL, async send => {
	const res = await hitokotoT(5);
	send(
		res
			? temp(LCOM.hitokotoList.info, {
					content: res,
			  })
			: BOT_RESULT.SERVER_ERROR,
	);
});

Cmd.register(LCOM.hitokotoList.cmd[5], undefined, undefined, I.SCOPE.ALL, I.ACCESS.NORMAL, async send => {
	const res = await hitokotoT(6);
	send(
		res
			? temp(LCOM.hitokotoList.info, {
					content: res,
			  })
			: BOT_RESULT.SERVER_ERROR,
	);
});

Cmd.register(LCOM.hitokotoList.cmd[6], undefined, undefined, I.SCOPE.ALL, I.ACCESS.NORMAL, async send => {
	const res = await hitokotoT(7);
	send(
		res
			? temp(LCOM.hitokotoList.info, {
					content: res,
			  })
			: BOT_RESULT.SERVER_ERROR,
	);
});

Cmd.register(LCOM.hitokotoList.cmd[7], undefined, undefined, I.SCOPE.ALL, I.ACCESS.NORMAL, async send => {
	const res = await hitokotoT(8);
	send(
		res
			? temp(LCOM.hitokotoList.info, {
					content: res,
			  })
			: BOT_RESULT.SERVER_ERROR,
	);
});

Cmd.register(LCOM.hitokotoList.cmd[8], undefined, undefined, I.SCOPE.ALL, I.ACCESS.NORMAL, async send => {
	const res = await hitokotoT(9);
	send(
		res
			? temp(LCOM.hitokotoList.info, {
					content: res,
			  })
			: BOT_RESULT.SERVER_ERROR,
	);
});

Cmd.register(LCOM.hitokotoList.cmd[9], undefined, undefined, I.SCOPE.ALL, I.ACCESS.NORMAL, async send => {
	const res = await hitokotoT(10);
	send(
		res
			? temp(LCOM.hitokotoList.info, {
					content: res,
			  })
			: BOT_RESULT.SERVER_ERROR,
	);
});

Cmd.register(LCOM.hitokotoList.cmd[10], undefined, undefined, I.SCOPE.ALL, I.ACCESS.NORMAL, async send => {
	const res = await hitokotoT(11);
	send(
		res
			? temp(LCOM.hitokotoList.info, {
					content: res,
			  })
			: BOT_RESULT.SERVER_ERROR,
	);
});

Cmd.register(LCOM.hitokotoList.cmd[11], undefined, undefined, I.SCOPE.ALL, I.ACCESS.NORMAL, async send => {
	const res = await hitokotoT(12);
	send(
		res
			? temp(LCOM.hitokotoList.info, {
					content: res,
			  })
			: BOT_RESULT.SERVER_ERROR,
	);
});

Cmd.register(LCOM.hitokotoList.cmd[12], undefined, undefined, I.SCOPE.ALL, I.ACCESS.NORMAL, async send => {
	const res = await hitokotoT(14);
	send(
		res
			? temp(LCOM.hitokotoList.info, {
					content: res,
			  })
			: BOT_RESULT.SERVER_ERROR,
	);
});

Cmd.register(LCOM.hitokotoList.cmd[13], undefined, undefined, I.SCOPE.ALL, I.ACCESS.NORMAL, async send => {
	const res = await hitokotoT(15);
	send(
		res
			? temp(LCOM.hitokotoList.info, {
					content: res,
			  })
			: BOT_RESULT.SERVER_ERROR,
	);
});

Cmd.register(LCOM.hitokotoList.cmd[14], undefined, undefined, I.SCOPE.ALL, I.ACCESS.NORMAL, async send => {
	const res = await hitokotoT(16);
	send(
		res
			? temp(LCOM.hitokotoList.info, {
					content: res,
			  })
			: BOT_RESULT.SERVER_ERROR,
	);
});

/* funSys */
Cmd.register(
	LCOM.feel.cmd,
	LCOM.feel.descr,
	'funSys',
	I.SCOPE.ALL,
	I.ACCESS.NORMAL,
	async (send, data) => {
		const target = getQq(M.args[1]) || data.user_id;
		send(LCOM.feel.info, {
			image: SDK.cq_image(`http://api.tombk.cn/API/dtt/mo.php?QQ=${target}`),
		});
	},
	[
		{
			must: false,
			name: 'QQ/At',
		},
	],
);

Cmd.register(
	LCOM.climb.cmd,
	LCOM.climb.descr,
	'funSys',
	I.SCOPE.ALL,
	I.ACCESS.NORMAL,
	async (send, data) => {
		const target = getQq(M.args[1]) || data.user_id;
		send(LCOM.climb.info, {
			image: SDK.cq_image(`http://api.tombk.cn/API/pa/pa.php?qq=${target}`),
		});
	},
	[
		{
			must: false,
			name: 'QQ/At',
		},
	],
);

Cmd.register(
	LCOM.threaten.cmd,
	LCOM.threaten.descr,
	'funSys',
	I.SCOPE.ALL,
	I.ACCESS.NORMAL,
	async (send, data) => {
		const target = getQq(M.args[1]) || data.user_id;
		send(LCOM.threaten.info, {
			image: SDK.cq_image(`http://api.tombk.cn/API/dtt/weixie.php?QQ=${target}`),
		});
	},
	[
		{
			must: false,
			name: 'QQ/At',
		},
	],
);

Cmd.register(
	LCOM.hold.cmd,
	LCOM.hold.descr,
	'funSys',
	I.SCOPE.ALL,
	I.ACCESS.NORMAL,
	async (send, data) => {
		send(LCOM.hold.info, {
			image: SDK.cq_image(`http://api.tombk.cn/API/dtt/qian.php?qq1=${data.user_id}&qq2=${getQq(M.args[1])}`),
		});
	},
	[
		{
			must: true,
			name: 'QQ/At',
		},
	],
);

/* gptChat */
Cmd.register(
	LCOM.gpt.cmd,
	LCOM.gpt.descr,
	'gptChat',
	I.SCOPE.ALL,
	I.ACCESS.NORMAL,
	async send => {
		const res = await M.fetchJ(URL.GPT, undefined, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${CAPIKEY.bot.chatgpt}`,
			},
			body: JSON.stringify({
				model: 'gpt-3.5-turbo',
				messages: [
					{
						role: 'user',
						content: M.args[1],
					},
				],
			}),
		});

		send(LCOM.gpt.info, {
			content:
				!res.choices || !res.choices[0] || !res.choices[0].message || !res.choices[0].message.content
					? BOT_RESULT.SERVER_ERROR
					: res.choices[0].message.content,
		});
	},
	[
		{
			must: true,
			name: LCOM.gpt.args[0],
			rest: true,
		},
	],
);

Cmd.register(LCOM.cl.cmd, LCOM.cl.descr, 'gptChat', I.SCOPE.ALL, I.ACCESS.NORMAL, () => BOT_RESULT.REPAIRING, [
	{
		must: true,
		name: LCOM.cl.args[0],
		rest: true,
	},
]);

/* specialCom */
Cmd.register(LCOM.api.cmd, LCOM.api.descr, 'specialCom', I.SCOPE.ALL, I.ACCESS.NORMAL, async send => {
	const content = await M.fetchT('https://api.imlolicon.tk/sys/datastat', { format: 'text' });
	send(
		content
			? temp(LCOM.api.info, {
					content,
			  })
			: BOT_RESULT.SERVER_ERROR,
	);
});

/* aboutInfo */
Cmd.register(
	LCOM.alias.cmd,
	undefined,
	'aboutInfo',
	I.SCOPE.ALL,
	I.ACCESS.MANGER,
	() => {
		const data = M.loadConfigP('alias.json', {}) as obj<string>;
		if (M.args[1] === 'query') {
			let list = '';
			Object.keys(data).forEach(key => {
				list += temp(LCOM.alias.list, {
					key,
					val: data[key],
				});
			});
			return temp(LCOM.alias.query, {
				list: list || BOT_RESULT.EMPTY,
			});
		}
		if (M.args[1] === 'add') {
			if (data[M.args[2]]) return BOT_RESULT.EXIST;
			M.args[3] = `/${M.args[3]}`;
			if (!Main.isUsefulCmd(M.args[3].split(' ')[0], M.args[3])) return LCOM.alias.fail2;
			data[M.args[2]] = M.args[3];
			M.saveConfigP('alias.json', data);
			return temp(LCOM.alias.add, {
				input: M.args[2],
			});
		}
		if (M.args[1] === 'del') {
			if (!data[M.args[2]]) return BOT_RESULT.NO_EXIST;
			delete data[M.args[2]];
			M.saveConfigP('alias.json', data);
			return temp(LCOM.alias.del, {
				input: M.args[2],
			});
		}
		return BOT_RESULT.ARGS_ERROR;
	},
	{
		query: {
			descr: LCOM.alias.descr[0],
		},
		add: {
			descr: LCOM.alias.descr[1],
			args: [
				{
					must: true,
					name: LCOM.alias.args[0],
				},
				{
					must: true,
					name: LCOM.alias.args[1],
					rest: true,
				},
			],
		},
		del: {
			descr: LCOM.alias.descr[2],
			args: [
				{
					must: true,
					name: LCOM.alias.args[0],
				},
			],
		},
	},
);

Cmd.register(LCOM.core.cmd, LCOM.core.descr, 'aboutInfo', I.SCOPE.ALL, I.ACCESS.NORMAL, () =>
	temp(LCOM.core.info, {
		commands: Com.size,
	}),
);

Cmd.register(
	LCOM.help.cmd,
	LCOM.help.descr,
	'aboutInfo',
	I.SCOPE.ALL,
	I.ACCESS.NORMAL,
	() => {
		if (!M.args[1]) return temp(LCOM.help.info, { content: '' });
		M.args[1] = `/${M.args[1]}`;
		for (const key of CmdInfo) {
			const { 0: cmd, 1: val } = key;
			if (typeof cmd === 'string' && cmd !== M.args[1]) continue;
			if (Array.isArray(cmd) && !cmd.includes(M.args[1])) continue;
			if (typeof cmd === 'function') continue;
			return temp(LCOM.help.info, {
				content: Cmd.menuHandleParams(cmd, val),
			});
		}
		return LCOM.help.fail;
	},
	[
		{
			must: false,
			name: LCOM.help.args[0],
		},
	],
);

Cmd.register(LCOM.config.cmd, LCOM.config.descr, 'aboutInfo', I.SCOPE.ALL, I.ACCESS.NORMAL, () => {
	let whiteContent = '';
	if (CGROUP.enable) {
		let groupList = '';
		for (const content of CGROUP.list) {
			groupList += temp(LCOM.config.list, {
				content,
			});
		}
		whiteContent = temp(LCOM.config.white, {
			group_list: groupList,
		});
	}
	const mangeContent = CMANGE.enable
		? temp(LCOM.config.mange, {
				join_group_welcome: formatOption(CMANGE.joinGroupWelcome),
				exit_group_add_black: formatOption(CMANGE.exitGroupAddBlack),
				ban_time: CMANGE.banTime,
				banword_ban_time: CMANGE.banwordBanTime,
				repeat_ban_time: CMANGE.repeatBanTime,
				cycle_time: CMANGE.repeatRule.cycleTime,
				max_times: CMANGE.repeatRule.maxTimes,
				max_list_nums: CFORMAT.maxListNums,
		  })
		: '';
	return temp(LCOM.config.info, {
		group_enable: formatOption(CGROUP.enable),
		white_content: whiteContent,
		main_menu: formatOption(CCOM.mainMenu),
		mange_enable: formatOption(CMANGE.enable),
		mange_content: mangeContent,
	});
});

Cmd.register(LCOM.view.cmd, LCOM.view.descr, 'aboutInfo', I.SCOPE.ALL, I.ACCESS.NORMAL, () => {
	const { connect, control, bot } = Main.Const.CONFIG;
	const { mode, http, ws, 'ws-reverse': wsReverse } = connect;
	let modeContent = '';
	let userList = '';
	let groupList = '';
	switch (mode) {
		case 'http':
			modeContent = temp(LCOM.view.modeContentHttp, {
				...http,
				reverse_port: http['reverse-port'],
				retry_time: http['retry-time'],
			});
			break;
		case 'ws':
			modeContent = temp(LCOM.view.modeContentWs, {
				...ws,
				retry_time: ws['retry-time'],
			});
			break;
		case 'ws-reverse':
			modeContent = temp(LCOM.view.modeContentWsReverse, {
				...wsReverse,
			});
			break;
	}
	const params = control.params.length > 0 ? control.params.join(' ') : BOT_RESULT.EMPTY;
	bot.users.list.forEach(content => {
		userList += temp(LCOM.view.list, { content });
	});
	bot.groups.list.forEach(content => {
		groupList += temp(LCOM.view.list, { content });
	});
	switch (bot.users.type) {
		case BotConfigFilter.BLACK:
			userList = temp(LCOM.view.userListBlack, {
				list: bot.users.type,
			});
			break;
		case BotConfigFilter.WHITE:
			userList = temp(LCOM.view.userListWhite, {
				list: userList,
			});
			break;
	}
	switch (bot.groups.type) {
		case BotConfigFilter.BLACK:
			groupList = temp(LCOM.view.groupListBlack, {
				list: groupList,
			});
			break;
		case BotConfigFilter.WHITE:
			groupList = temp(LCOM.view.groupListWhite, {
				list: groupList,
			});
			break;
	}

	return temp(LCOM.view.info, {
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
});

Cmd.register(
	LCOM.plugin.cmd,
	undefined,
	'aboutInfo',
	I.SCOPE.ALL,
	I.ACCESS.NORMAL,
	() => {
		const pluginsJson = path.join(Main.Const.ROOT_PATH, 'plugins.json');
		const data = loadConfig(pluginsJson) as string[];
		if (M.args[1] === 'query') {
			let result = '';
			for (const element of Main.Proxy) {
				if (M.args[2] && element[1] !== M.args[2]) continue;
				const res = element[3] ?? {};
				res.name = res?.name ?? BOT_RESULT.EMPTY;
				res.version = res?.version ?? BOT_RESULT.EMPTY;
				res.description = res?.description ?? BOT_RESULT.EMPTY;
				res.author = res?.author ?? BOT_RESULT.EMPTY;
				res.license = res?.license ?? BOT_RESULT.EMPTY;
				result += temp(LCOM.plugin.list, {
					id: element[1],
					...res,
					state: formatOption(!data.includes(element[1])),
				});
			}
			return result
				? temp(LCOM.plugin.query, {
						num: Main.Proxy.length,
						list: result,
				  })
				: temp(LCOM.plugin.fail, {
						target: M.args[2],
				  });
		}
		if (M.args[1] === 'ban') {
			if (data.includes(M.args[2])) return BOT_RESULT.EXIST;
			data.push(M.args[2]);
			saveConfig(pluginsJson, data);
			return temp(LCOM.plugin.ban, {
				target: M.args[2],
			});
		}
		if (M.args[1] === 'unban') {
			if (!data.includes(M.args[2])) return BOT_RESULT.NO_EXIST;
			saveConfig(
				pluginsJson,
				data.filter(item => item !== M.args[2]),
			);
			return temp(LCOM.plugin.unban, {
				target: M.args[2],
			});
		}
		return BOT_RESULT.ARGS_ERROR;
	},
	{
		query: {
			descr: LCOM.plugin.descr[0],
			args: [
				{
					must: false,
					name: LCOM.plugin.args[0],
				},
			],
		},
		ban: {
			descr: LCOM.plugin.descr[0],
			args: [
				{
					must: true,
					name: LCOM.plugin.args[0],
				},
			],
		},
		unban: {
			descr: LCOM.plugin.descr[0],
			args: [
				{
					must: true,
					name: LCOM.plugin.args[0],
				},
			],
		},
	},
);

Cmd.register(LCOM.bot.cmd, LCOM.bot.descr, 'aboutInfo', I.SCOPE.ALL, I.ACCESS.NORMAL, () => {
	const { self_id: selfId, connect, status } = Main.Const.BOT;
	const STAT = status.stat;
	const { version, license } = getPackageInfo();
	const ENV = M.dealEnv();
	return temp(LCOM.bot.info, {
		self_id: selfId,
		version,
		license,
		...STAT,
		...ENV,
		connect: formatTime(new Date(connect * 1000)),
		last_message_time: formatTime(new Date(STAT.last_message_time * 1000)),
	});
});

Cmd.register(LCOM.status.cmd, LCOM.status.descr, 'aboutInfo', I.SCOPE.ALL, I.ACCESS.NORMAL, () => {
	const { model, speed, num, rate: cpuRate } = M.dealCpu();
	const { total, used, rate: ramRate } = M.dealRam();
	return temp(LCOM.status.info, {
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
		time: M.dealTime(),
		hostname: os.hostname(),
		homedir: os.homedir(),
	});
});

Cmd.register(LCOM.about.cmd, LCOM.about.descr, 'aboutInfo', I.SCOPE.ALL, I.ACCESS.NORMAL, () => {
	const { version, license } = getPackageInfo();
	return temp(LCOM.about.info, {
		version,
		license,
	});
});

Cmd.register(LCOM.update.cmd, LCOM.update.descr, 'aboutInfo', I.SCOPE.ALL, I.ACCESS.NORMAL, async send => {
	const { version } = getPackageInfo();
	const res = (await fetchJson('https://biyuehu.github.io/kotori-bot/package.json')) as PackageInfo;
	const content =
		res.version === version
			? LCOM.update.yes
			: temp(LCOM.update.no, {
					version: res.version,
			  });
	send(
		res && res.version
			? temp(LCOM.update.info, {
					version,
					content,
			  })
			: BOT_RESULT.SERVER_ERROR,
	);
});

/* groupMange */
Cmd.register(
	LCOM.ban.cmd,
	LCOM.ban.descr,
	'groupMange',
	I.SCOPE.GROUP,
	I.ACCESS.MANGER,
	(send, data) => {
		if (!Main.verifyEnable(send)) return;
		const target = getQq(M.args[1]);
		const time = parseInt(M.args[2], 10) * 60;
		if (target) {
			Main.Api.set_group_ban(data.group_id!, target, time);
			send(LCOM.ban.user, {
				target,
				time: time / 60,
			});
			return;
		}
		if (!target && M.args[1]) {
			send(BOT_RESULT.ARGS_ERROR);
			return;
		}
		Main.Api.set_group_whole_ban(data.group_id!);
		send(LCOM.ban.all);
	},
	[
		{
			must: false,
			name: LCOM.ban.args[0],
		},
		{
			must: (CMANGE.banTime / 60).toString(),
			name: LCOM.ban.args[1],
		},
	],
);

Cmd.register(
	LCOM.unban.cmd,
	LCOM.unban.descr,
	'groupMange',
	I.SCOPE.GROUP,
	I.ACCESS.MANGER,
	(send, data) => {
		if (!Main.verifyEnable(send)) return;
		const target = getQq(M.args[1]);
		if (target) {
			Main.Api.set_group_ban(data.group_id!, target, 0);
			send(LCOM.unban.user, {
				target,
			});
			return;
		}
		if (!target && M.args[1]) {
			send(BOT_RESULT.ARGS_ERROR);
			return;
		}
		Main.Api.set_group_whole_ban(data.group_id!, false);
		send(LCOM.unban.all);
	},
	[
		{
			must: false,
			name: LCOM.unban.args[0],
		},
	],
);

Cmd.register(
	LCOM.black.cmd,
	undefined,
	'groupMange',
	I.SCOPE.GROUP,
	I.ACCESS.MANGER,
	(send, data) => {
		if (!Main.verifyEnable(send)) return;
		const message = M.controlParams(path.join(data.group_id!.toString(), 'blackList.json'), [
			LCOM.black.query,
			LCOM.black.add,
			LCOM.black.del,
			LCOM.white.list,
		]);
		send(message);
	},
	{
		query: {
			descr: LCOM.black.descr[0],
			args: [
				{
					must: false,
					name: LCOM.black.args[0],
				},
			],
		},
		add: {
			descr: LCOM.black.descr[1],
			args: [
				{
					must: false,
					name: LCOM.black.args[0],
				},
			],
		},
		del: {
			descr: LCOM.black.descr[2],
			args: [
				{
					must: false,
					name: LCOM.black.args[0],
				},
			],
		},
	},
);

Cmd.register(
	LCOM.white.cmd,
	undefined,
	'groupMange',
	I.SCOPE.GROUP,
	I.ACCESS.MANGER,
	(send, data) => {
		if (!Main.verifyEnable(send)) return;
		const message = M.controlParams(path.join(data.group_id!.toString(), 'whiteList.json'), [
			LCOM.white.query,
			LCOM.white.add,
			LCOM.white.del,
			LCOM.white.list,
		]);
		send(message);
	},
	{
		query: {
			descr: LCOM.white.descr[0],
			args: [
				{
					must: false,
					name: LCOM.white.args[0],
				},
			],
		},
		add: {
			descr: LCOM.white.descr[1],
			args: [
				{
					must: false,
					name: LCOM.white.args[0],
				},
			],
		},
		del: {
			descr: LCOM.white.descr[2],
			args: [
				{
					must: false,
					name: LCOM.white.args[0],
				},
			],
		},
	},
);

Cmd.register(
	LCOM.kick.cmd,
	LCOM.kick.descr,
	'groupMange',
	I.SCOPE.GROUP,
	I.ACCESS.MANGER,
	(send, data) => {
		if (!Main.verifyEnable(send)) return;
		const target = getQq(M.args[1]);
		if (target) {
			Main.Api.set_group_kick(data.group_id!, target);
			send(LCOM.kick.info, {
				target,
			});
			return;
		}
		send(BOT_RESULT.ARGS_ERROR);
	},
	[
		{
			must: true,
			name: LCOM.kick.args[0],
		},
	],
);

Cmd.register(
	LCOM.all.cmd,
	LCOM.all.descr,
	'groupMange',
	I.SCOPE.GROUP,
	I.ACCESS.MANGER,
	send => {
		if (!Main.verifyEnable(send)) return;
		send(LCOM.all.info, {
			all: SDK.cq_at('all'),
			input: M.args[1],
		});
	},
	[
		{
			must: true,
			name: LCOM.all.args[0],
		},
	],
);

Cmd.register(
	LCOM.notice.cmd,
	LCOM.notice.descr,
	'groupMange',
	I.SCOPE.GROUP,
	I.ACCESS.MANGER,
	(send, data) => {
		if (!Main.verifyEnable(send)) return;
		const image = SDK.get_image(M.args[1]);
		Main.Api.send_group_notice(
			data.group_id!,
			temp(LCOM.notice.info, {
				input: M.args[1],
			}),
			image || undefined,
		);
	},
	[
		{
			must: true,
			name: LCOM.notice.args[0],
		},
	],
);

/* superMange */
Cmd.register(
	LCOM.system.cmd,
	undefined,
	'superMange',
	I.SCOPE.ALL,
	I.ACCESS.ADMIN,
	(send, data) => {
		if (
			!existsSync(path.join(Main.Const.ROOT_PATH, Main.Const.CONFIG.control.signserver)) ||
			!existsSync(path.join(Main.Const.ROOT_PATH, Main.Const.CONFIG.control.program))
		) {
			send(LCOM.system.fail);
			return;
		}
		const num = parseInt(M.args[1], 10);
		const save = () => {
			saveConfig(
				path.join(Main.Const.DATA_PLUGIN_PATH, 'system.ini'),
				data.group_id ? data.group_id.toString() : 'private',
				'txt',
			);
		};
		if (!num) {
			send(LCOM.system.info_0);
			save();
			setTimeout(() => {
				Main.Process[0].restart();
			}, 2000);
		} else if (num === 1) {
			send(LCOM.system.info_1);
			save();
			setTimeout(() => {
				Main.Process[1].restart();
				Main.Process[0].restart();
			}, 2000);
		}
	},
	{
		'0': {
			descr: LCOM.system.descr[0],
		},
		'1': {
			descr: LCOM.system.descr[1],
		},
	},
);

Cmd.register(
	LCOM.blackg.cmd,
	undefined,
	'superMange',
	I.SCOPE.ALL,
	I.ACCESS.ADMIN,
	send => {
		if (!Main.verifyEnable(send)) return;
		const message = M.controlParams(`blackList.json`, [
			LCOM.blackg.query,
			LCOM.blackg.add,
			LCOM.blackg.del,
			LCOM.blackg.list,
		]);
		send(message);
	},
	{
		query: {
			descr: LCOM.blackg.descr[0],
			args: [
				{
					must: false,
					name: LCOM.blackg.args[0],
				},
			],
		},
		add: {
			descr: LCOM.blackg.descr[1],
			args: [
				{
					must: false,
					name: LCOM.blackg.args[0],
				},
			],
		},
		del: {
			descr: LCOM.blackg.descr[2],
			args: [
				{
					must: false,
					name: LCOM.blackg.args[0],
				},
			],
		},
	},
);

Cmd.register(
	LCOM.whiteg.cmd,
	undefined,
	'superMange',
	I.SCOPE.ALL,
	I.ACCESS.ADMIN,
	send => {
		if (!Main.verifyEnable(send)) return;
		const message = M.controlParams(`whiteList.json`, [
			LCOM.whiteg.query,
			LCOM.whiteg.add,
			LCOM.whiteg.del,
			LCOM.whiteg.list,
		]);
		send(message);
	},
	{
		query: {
			descr: LCOM.white.descr[0],
			args: [
				{
					must: false,
					name: LCOM.white.args[0],
				},
			],
		},
		add: {
			descr: LCOM.white.descr[1],
			args: [
				{
					must: false,
					name: LCOM.white.args[0],
				},
			],
		},
		del: {
			descr: LCOM.white.descr[2],
			args: [
				{
					must: false,
					name: LCOM.white.args[0],
				},
			],
		},
	},
);

Cmd.register(
	LCOM.manger.cmd,
	undefined,
	'superMange',
	I.SCOPE.GROUP,
	I.ACCESS.ADMIN,
	(send, data) => {
		if (!Main.verifyEnable(send)) return;
		const message = M.controlParams(`${data.group_id}\\mangerList.json`, [
			LCOM.manger.query,
			LCOM.manger.add,
			LCOM.manger.del,
			LCOM.manger.list,
		]);
		send(message);
	},
	{
		query: {
			descr: LCOM.manger.descr[0],
			args: [
				{
					must: false,
					name: LCOM.manger.args[0],
				},
			],
		},
		add: {
			descr: LCOM.manger.descr[1],
			args: [
				{
					must: false,
					name: LCOM.manger.args[0],
				},
			],
		},
		del: {
			descr: LCOM.manger.descr[2],
			args: [
				{
					must: false,
					name: LCOM.manger.args[0],
				},
			],
		},
	},
);

Cmd.register(
	LCOM.banword.cmd,
	undefined,
	'superMange',
	I.SCOPE.ALL,
	I.ACCESS.ADMIN,
	send => {
		if (!Main.verifyEnable(send)) return;
		const message = M.controlParams(
			`banword.json`,
			[LCOM.banword.query, LCOM.banword.add, LCOM.banword.del, LCOM.banword.list],
			true,
		);
		send(message);
	},
	{
		query: {
			descr: LCOM.banword.descr[0],
			args: [
				{
					must: false,
					name: LCOM.banword.args[0],
				},
			],
		},
		add: {
			descr: LCOM.banword.descr[1],
			args: [
				{
					must: false,
					name: LCOM.banword.args[0],
				},
			],
		},
		del: {
			descr: LCOM.banword.descr[2],
			args: [
				{
					must: false,
					name: LCOM.banword.args[0],
				},
			],
		},
	},
);

Cmd.auto(async () => {
	const { version } = getPackageInfo();
	const res = (await fetch('https://biyuehu.github.io/kotori-bot/package.json')
		.then(res => res.json())
		.catch()) as PackageInfo;
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
		temp(LCOM.update.info, {
			version,
			content: temp(LCOM.update.no, {
				version: res.version,
			}),
		}),
		Main.Const.CONFIG.bot.master,
	);
});

Cmd.auto(() => {
	const result = loadConfig(path.join(Main.Const.DATA_PLUGIN_PATH, 'system.ini'), 'txt') as string;
	const isPrivate = result === 'private';
	const id = isPrivate ? Main.Const.CONFIG.bot.master : parseInt(result, 10);
	if (id) Main.Api.send_msg(isPrivate ? 'private' : 'group', LCOM.system.info, id);
	saveConfig(path.join(Main.Const.DATA_PLUGIN_PATH, 'system.ini'), '', 'txt');
});

export default Main;
