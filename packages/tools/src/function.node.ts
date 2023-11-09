import fs from 'fs';
import path from 'path';
import YAML from 'yaml';
import { ConfigFileType, FuncStringProcessStr, obj } from './types';
import { isObj } from './function';

export function loadConfig(
	filename: string,
	type: ConfigFileType = 'json',
	init: object | string = {},
): object | null | unknown[] | string {
	const dirname: string = path.dirname(filename);
	if (!fs.existsSync(dirname)) fs.mkdirSync(dirname, { recursive: true });
	if (!fs.existsSync(filename)) fs.writeFileSync(filename, typeof init === 'string' ? init : JSON.stringify(init));

	const data = fs.readFileSync(filename).toString();
	if (type === 'yaml') return YAML.parse(data);
	if (type === 'txt') return data;
	return JSON.parse(data);
}

export function saveConfig(filename: string, data: object | string, type: ConfigFileType = 'json'): void {
	let content: string = '';
	if (typeof data === 'object' && type === 'json') content = JSON.stringify(data);
	else if (typeof data === 'object' && type === 'yaml') content = YAML.stringify(data);
	else content = data as string;

	const dirname: string = path.dirname(filename);
	if (!fs.existsSync(dirname)) fs.mkdirSync(dirname, { recursive: true });

	fs.writeFileSync(filename, content);
}

export function createConfig(filename: string, data?: object, type: ConfigFileType = 'json'): void {
	let content: string = '';
	if (!fs.existsSync(filename)) {
		if (type === 'json') content = JSON.stringify(data);
		if (type === 'yaml') content = YAML.stringify(data);
		fs.writeFileSync(filename, content);
	}
}

export type FuncFetchSuper<T = Response> = (
	url: string,
	params?: { [key: string]: FuncStringProcessStr },
	init?: RequestInit,
) => Promise<T>;

export const fetchParam: FuncFetchSuper = (url, params, init) => {
	// logger.info(`${init?.method || 'GET'} Request url:${url} params:`, params || 'empty');
	let urlRaw = url;
	if (params) {
		urlRaw += '?';
		Object.keys(params).forEach(key => {
			urlRaw += `${key}=${encodeURIComponent(params[key])}&`;
		});
		urlRaw = urlRaw.substring(0, urlRaw.length - 1);
	}
	return fetch(urlRaw, init);
};

export const fetchJson: FuncFetchSuper<obj> = (url, params, init) => {
	const response = fetchParam(url, params, init).then(res => {
		const result = res.json();
		if (!isObj(result)) throw new Error('Http response type error,should be json');
		return result as obj;
	});
	return response;
};

export const fetchText: FuncFetchSuper<string | void> = (url, params, init) => {
	const response = fetchParam(url, params, init).then(res => {
		const result = res.text();
		return result;
	});
	return response;
};
