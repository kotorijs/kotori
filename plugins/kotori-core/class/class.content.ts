import path from 'path';
import { Api, Const, EventDataType, obj, parseCommand } from '@/tools';
import SDK from '@/utils/class.sdk';
import {
	ACCESS,
	SCOPE,
	Send,
	CoreKeyword,
	CoreKeywordMatch,
	InfoArgEx,
	CoreVal,
	InfoArg,
	BOT_RESULT,
	Hook,
} from '../type';
import { loadConfigP, temp } from '../method';
import Core from './class.core';
import Data from './class.data';

export class Content extends Data {
	private data: EventDataType;

	private api: Api;

	public constructor(data: EventDataType, api: Api, consts: Const, callbacks?: Hook[]) {
		super();
		this.data = data;
		this.api = api;
		Content.consts = consts;
		Core.args = parseCommand(this.data.message);

		if (callbacks) {
			for (const callback of callbacks) {
				if (!callback(data, this.send, api)) return;
			}
		}

		const result = Content.isUsefulCmd(Core.args[0], this.data.message);
		if (result) this.runHandlerFunc(...result);
		this.runAlias();
	}

	private static consts: Const;

	public static verifyAccess = (data: EventDataType) => {
		if (data.user_id === this.consts.CONFIG.bot.master) return ACCESS.ADMIN;
		if (!data.group_id) return ACCESS.NORMAL;
		if (data.sender.role === 'admin' || data.sender.role === 'owner') return ACCESS.MANGER;
		const mangerList = loadConfigP(path.join(data.group_id.toString(), 'mangerList.json')) as number[];
		return mangerList.includes(data.user_id) ? ACCESS.MANGER : ACCESS.NORMAL;
	};

	public static verifyFrom = (data: EventDataType) => {
		if (data.user_id === data.self_id) return false;
		return true;
	};

	public static isUsefulCmd = (cmd: string, message: string): [CoreVal, CoreKeyword | CoreKeywordMatch] | null => {
		const result = Data.cmdData.get(cmd);
		if (result) return [result, cmd];

		for (const [key, handlerFunc] of Data.cmdData) {
			if (
				typeof key !== 'string' &&
				((typeof key === 'function' && key(message)) || (Array.isArray(key) && key.includes(message)))
			)
				return [handlerFunc, key];
		}
		return null;
	};

	private send: Send = (contents, params = {}) => {
		let content = contents;
		if (typeof content !== 'object') content = temp(content, params);
		if (this.data.message_type === 'private') {
			this.api.send_private_msg(content, this.data.user_id);
		} else {
			this.api.send_group_msg(content, this.data.group_id!);
		}
	};

	private checkParams = (key: CoreKeyword) => {
		const params = Data.cmdInfoData.get(key)?.params;

		if (!params) return true;
		if (Array.isArray(params)) return this.checkParamsArr(params);
		return this.checkParamsObj(params);
	};

	private checkParamsArr = (params: InfoArg[], num: number = 1) => {
		for (const indexs of Object.keys(params)) {
			const index = parseInt(indexs, 10);
			const indexNum = index + num;
			if (params[index].rest) {
				Core.args = this.data.message.split(' ');
				for (let init = 0; init < Core.args.length; init += 1) {
					if (init > indexNum && Core.args[init]) Core.args[indexNum] += ` ${Core.args[init]}`;
				}
			}

			if (!Core.args[indexNum] && params[index].must === true) {
				this.send(BOT_RESULT.ARGS_EMPTY);
				return false;
			}

			if (!Core.args[indexNum] && typeof params[index].must === 'string') {
				Core.args[indexNum] = params[index].must as string;
			}

			if (params[index].rest) return true;
		}
		return true;
	};

	private checkParamsObj = (params: InfoArgEx, num: number = 1) => {
		if (!Core.args[num]) {
			this.send(BOT_RESULT.ARGS_ERROR);
			return false;
		}
		const result = params[Core.args[num]];
		if (result === undefined) {
			this.send(BOT_RESULT.ARGS_ERROR);
			return false;
		}
		if (Array.isArray(result.args)) {
			return this.checkParamsArr(result.args, num + 1);
		}
		return true;
	};

	private checkScope = (scope: SCOPE) => {
		if (scope === SCOPE.ALL) return true;
		if (scope === SCOPE.PRIVATE && this.data.message_type === 'private') return true;
		if (scope === SCOPE.GROUP && this.data.message_type === 'group') return true;
		this.send(BOT_RESULT.MESSAGE_TYPE);
		return false;
	};

	private checkAccess = (access: ACCESS) => {
		const result = Content.verifyAccess(this.data) >= access;
		if (!result) this.send(access === ACCESS.ADMIN ? BOT_RESULT.NO_ACCESS_2 : BOT_RESULT.NO_ACCESS_1);
		return result;
	};

	private runHandlerFunc = async (handlerFunc: CoreVal, key: CoreKeyword | CoreKeywordMatch) => {
		if (typeof key !== 'function') {
			const cmdInfo = Data.cmdInfoData.get(key);
			if (!cmdInfo) return;
			if (!this.checkScope(cmdInfo.scope)) return;
			if (!this.checkAccess(cmdInfo.access)) return;
			if (!this.checkParams(key)) return;
		}

		if (this.data.message_type === 'group') {
			this.api.send_group_msg(SDK.cq_poke(this.data.user_id), this.data.group_id!);
		}
		if (typeof handlerFunc === 'string') {
			this.send(handlerFunc);
			return;
		}

		const listenr = (error: unknown) => {
			process.removeListener('unhandledRejection', listenr);
			Content.isErroring = false;
			this.send(BOT_RESULT.UNKNOWN_ERROR, {
				error: error instanceof Error ? error.toString() : JSON.stringify(error),
			});
		};
		if (!Content.isErroring) {
			Content.isErroring = true;
			console.info('1');
			// process.removeAllListeners('unhandledRejection');
			process.on('unhandledRejection', listenr);
		}

		const result = await handlerFunc(this.send, this.data);
		process.removeListener('unhandledRejection', listenr);
		Content.isErroring = false;
		if (!result) return;
		if (typeof result === 'string') {
			this.send(result);
			return;
		}
		if (!Array.isArray(result)) return;
		Object.keys(result[1]).forEach(Element => {
			const val = result[1][Element];
			const type = typeof val;
			if (val instanceof Error) result[1][Element] = val.toString();
			else if (type === 'undefined') result[1][Element] = 'undefined';
			else if (type === 'object' && !val) result[1][Element] = 'null';
			else if (type !== 'string' && type !== 'number') result[1][Element] = JSON.stringify(val);
		});
		this.send(result[0], result[1] as obj<string | number>);
	};

	private runAlias = () => {
		const data = (loadConfigP('alias.json', {}) as obj<string>)[this.data.message];
		if (!data || typeof data !== 'string') return;
		this.data.message = data;
		JSON.stringify(new Content(this.data, this.api, Content.consts));
	};
}

export default Content;
