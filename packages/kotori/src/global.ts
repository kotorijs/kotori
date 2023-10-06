import fs from 'fs';
import path from 'path';
import { isObj, loadConfig, obj } from '@kotori-bot/tools';
import { LocaleIdentifier } from '@kotori-bot/i18n';
import KotoriError from './errror';
import { AdapterConfig } from './adapter';

interface PackageInfo {
	name: string;
	version: string;
	description: string;
	main: string;
	types: string;
	// scripts: obj<string>;
	author: string;
	license: string;
	bugs: {
		url: string;
	};
	homepage: string;
	dependencies: obj<string>;
	devDependencies: obj<string>;
}

export interface GlobalConfig {
	adapter: {
		[propName: string]: AdapterConfig;
	};
}

export const CONST = (() => {
	let ROOT = path.resolve(__dirname, '..');
	let count = 0;
	while (!fs.existsSync(path.join(ROOT, 'kotori.yml'))) {
		if (count > 5) throw new KotoriError('cannot find kotori-bot global kotori.yml', 'CoreError');
		ROOT = path.join(ROOT, '..');
		count += 1;
	}

	return {
		ROOT,
		MODULES: path.join(ROOT, 'modules'),
		DATA: path.join(ROOT, 'data'),
		LOGS: path.join(ROOT, 'logs'),
	};
})();

const checkGlobalConfig = (data: unknown): data is GlobalConfig => {
	if (!data || !isObj(data) || !isObj(data.adapter, {} as obj)) return false;
	for (const el of Object.values(data.adapter)) {
		if (!isObj(el)) return false;
		if (typeof el.extend !== 'string' || typeof el.master !== 'number' || typeof el.lang !== 'string') return false;
		let checkLang = false;
		for (const val of Object.values(LocaleIdentifier)) {
			if (typeof val !== 'string') continue;
			if (val === el.lang) {
				checkLang = true;
				break;
			}
		}
		if (!checkLang) return false;
	}
	return true;
};

export const CONFIG = (() => {
	const data = loadConfig(path.join(CONST.ROOT, 'kotori.yml'), 'yaml');
	if (!checkGlobalConfig(data)) throw new KotoriError('kotori-bot global kotori.yml format error', 'CoreError');
	return data;
})();

export function getPackageInfo(): PackageInfo {
	const info = loadConfig(path.join(CONST.ROOT, 'package.json')) as PackageInfo;
	if (!info || !info.author || !info.name || !info.version || !info.license) {
		throw new KotoriError('cannot find kotori-bot package.json or format error', 'CoreError');
	}
	if (Array.isArray(info.author)) info.author = info.author[1];
	info.author = info.author.split(' <')[0];
	return info;
}
