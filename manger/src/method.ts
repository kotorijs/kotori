import { getQq, loadConfigP, saveConfigP, temp } from 'plugins/kotori-core/method';
import { BOT_RESULT } from 'plugins/kotori-core/type';
import { Core } from 'plugins/kotori-core';
import { FuncStringProcessStr, obj } from '@/tools';
import CONTROL_PARAMS from './type';

export const CACHE_MSG_TIMES: obj<{ time: number; times: number }> = {};

export const controlParams = (filePath: string, msg: [string, string, string, string], isString: boolean = false) => {
	let message = '';
	let list = loadConfigP(filePath) as FuncStringProcessStr[];
	const target = isString ? Core.args[2] : getQq(Core.args[2]);
	const check = () => {
		if (!Core.args[2]) {
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
	switch (Core.args[1]) {
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
			saveConfigP(filePath, list);
			break;
		case CONTROL_PARAMS.DEL:
			if (!check()) break;
			if (!list.includes(target!)) {
				message = BOT_RESULT.NO_EXIST;
				break;
			}
			list = list.filter(item => item !== target);
			message = temp(msg[2], { target: target! });
			saveConfigP(filePath, list);
			break;
		default:
			break;
	}
	saveConfigP(filePath, list);
	return message;
};
