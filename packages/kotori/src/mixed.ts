import Logger from '@kotori-bot/logger';
import Locale from '@kotori-bot/i18n';
import { FuncFetchSuper, fetchJson, fetchText, obj } from '@kotori-bot/tools';
import Message from './message';

const requestType = (method: string) => {
	const func: FuncFetchSuper<obj> = (url, params, init = { method }) => fetchJson(url, params, init);
	return func;
};

const http = {
	text: fetchText,
	json: fetchJson,
	get: requestType('get'),
	post: requestType('post'),
	put: requestType('put'),
	patch: requestType('patch'),
	delete: requestType('delete'),
	head: requestType('head'),
};

export class Content extends Message {
	public static http = http;

	public static logger = Logger;
}

/* export declare namespace JSX {
	interface IntrinsicElements {
		render: any;
	}
} */
export const Mixed = Object.assign(Content, new Locale('en_US'));

export default Mixed;
