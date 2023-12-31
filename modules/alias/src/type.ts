import { Locale, getPackageInfo } from '@/tools';
import { Api, EventDataType, Msg, obj } from '@/tools/type';
import SDK from '@/utils/class.sdk';

export const enum SCOPE {
	ALL,
	PRIVATE,
	GROUP,
}

export const enum ACCESS {
	NORMAL,
	MANGER,
	ADMIN,
}

export const enum URL {
	API = 'https://api.hotaru.icu/api/',
	BLOG = 'https://hotaru.icu/api/',
}

export const BOT_RESULT = new Proxy(
	{
		GUIDE: 'core.temp.result.guide',
		SERVER_ERROR: 'core.temp.result.data_error',
		ARGS_EMPTY: 'core.temp.result.args.empty',
		ARGS_ERROR: 'core.temp.result.args.error',
		UNKNOWN_ERROR: 'core.temp.result.unknown_error',
		NUM_ERROR: 'core.temp.result.num.error',
		NUM_CHOOSE: 'core.temp.result.num.choose',
		NO_ACCESS_1: 'core.temp.result.no_access.1',
		NO_ACCESS_2: 'core.temp.result.no_access.2',
		DISABLE: 'core.temp.result.disable',
		EXIST: 'core.temp.result.exist',
		NO_EXIST: 'core.temp.result.no_esist',
		REPAIRING: 'core.temp.result.repairing',
		APIKEY_EMPTY: 'core.temp.result.apikey_error',
		EMPTY: 'core.temp.result.empty',
		MESSAGE_TYPE: 'core.temp.result.message_type',
		OPTION_ON: 'core.temp.result.option.on',
		OPTION_OFF: 'core.temp.result.option.off',
	},
	{
		get(origin, target): string {
			if (typeof target === 'symbol') return '';
			return Locale.locale(origin[target as keyof typeof origin]);
		},
	},
);

export const GLOBAL = {
	HEAD: 'Kotori-Bot:',
	REPO: 'https://github.com/kotorijs/kotori',
	AVATAR: SDK.cq_image(`https://q.qlogo.cn/headimg_dl?spec=640&dst_uin=2142124427`),
	DOC: 'http://??????????.com',
	AUTHOR: `By ${getPackageInfo().author}`,
};

export type CoreKeyword = string | string[];
export type CoreKeywordMatch(str: string)  boolean;
export type CoreVal = CoreValCallback | string;
export type CoreValCallback(send: Send, data: EventDataType)  CoreValCallbackVal | Promise<CoreValCallbackVal>;
export type CoreValCallbackVal = void | string | [string, obj<unknown>];
export type Cmd<T = CoreVal> = Map<CoreKeyword | CoreKeywordMatch, T>;
export type CmdInfo = Cmd<InfoVal>;
export type InfoValArg = InfoArg[] | InfoArgEx;
export type Hook(data: EventDataType, send: Send, api: Api)  boolean;
export type Send(msg: Msg, params?: obj<string | number>)  void;

export interface InfoVal {
	params?: InfoValArg;
	help?: string;
	menuId?: string;
	scope: SCOPE;
	access: ACCESS;
}

export interface InfoArg {
	must: boolean | string;
	name?: string;
	rest?: boolean;
}

export interface InfoArgEx {
	[key: string]: {
		help?: string;
		args?: InfoArg[] /*  | InfoArgEx */ | null;
	};
}

export type dataType = string | number | boolean | obj | string[] | number[] | obj[];

export interface Res<T = dataType | null> extends obj {
	code: 500 | 501 | 502;
	message?: string;
	data?: T;
}

export interface ResAfter extends Res {
	code: 500;
	data: dataType;
}
