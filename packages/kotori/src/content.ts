import Logger from '@kotori-bot/logger';
import Locale from '@kotori-bot/i18n';
import { FuncFetchSuper, fetchJson, fetchText, obj } from '@kotori-bot/tools';
import Message from './message';
import { BaseDir, GlobalConfigs, GlobalOptions } from './types';

const requestType = (method: string) => {
	const func: FuncFetchSuper<obj> = (url, params, init = { method }) => fetchJson(url, params, init);
	return func;
};

const http = {
	text: fetchText,
	get: requestType('get'),
	post: requestType('post'),
	put: requestType('put'),
	patch: requestType('patch'),
	delete: requestType('delete'),
	head: requestType('head'),
};

export class Content extends Message {
	public http = http;

	public logger = Logger;

	public uselang;

	public setlang;

	public locale;

	public constructor(baseDir: BaseDir, configs: GlobalConfigs, env: GlobalOptions['node_env']) {
		super(baseDir, configs, env);
		const { uselang, setlang, locale } = new Locale(this.configs.global.lang);
		this.uselang = uselang;
		this.setlang = setlang;
		this.locale = locale;
	}
}

/* export declare namespace JSX {
	interface IntrinsicElements {
		render: any;
	}
} */

export default Content;
