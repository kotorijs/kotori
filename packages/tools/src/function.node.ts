import fs from 'fs';
import path from 'path';
import YAML from 'yaml';
import Logger from '@kotori-bot/logger';
import { ConfigFileType } from './type';

export function loadConfig(
	filename: string,
	type: ConfigFileType = 'json',
	init: object | string = {},
): object | null | unknown[] | string {
	const dirname: string = path.dirname(filename);
	if (!fs.existsSync(dirname)) fs.mkdirSync(dirname, { recursive: true });
	if (!fs.existsSync(filename)) fs.writeFileSync(filename, typeof init === 'string' ? init : JSON.stringify(init));

	const data = fs.readFileSync(filename).toString();
	try {
		if (type === 'yaml') return YAML.parse(data);
		if (type === 'txt') return data;
		return JSON.parse(data);
	} catch (err) {
		Logger.warn(err);
		return null;
	}
}

export function saveConfig(filename: string, data: object | string, type: ConfigFileType = 'json'): void {
	let content: string = '';
	try {
		if (typeof data === 'object' && type === 'json') content = JSON.stringify(data);
		else if (typeof data === 'object' && type === 'yaml') content = YAML.stringify(data);
		else content = data as string;

		const dirname: string = path.dirname(filename);
		if (!fs.existsSync(dirname)) fs.mkdirSync(dirname, { recursive: true });

		fs.writeFileSync(filename, content);
	} catch (err) {
		Logger.warn(err);
	}
}

export function createConfig(filename: string, data?: object, type: ConfigFileType = 'json'): void {
	let content: string = '';
	try {
		if (!fs.existsSync(filename)) {
			if (type === 'json') content = JSON.stringify(data);
			if (type === 'yaml') content = YAML.stringify(data);
			fs.writeFileSync(filename, content);
		}
	} catch (err) {
		Logger.warn(err);
	}
}
