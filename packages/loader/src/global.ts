import fs from 'fs';
import path from 'path';
import { isObj, loadConfig, obj } from '@kotori-bot/tools';
import { LocaleIdentifier, langType } from '@kotori-bot/i18n';
import { KotoriError, GlobalConfigs, BaseDir } from 'kotori-bot';

export const baseDir: BaseDir = (() => {
	let root = path.resolve(__dirname, '..').replace('loader', 'kotori');
	let count = 0;
	while (!fs.existsSync(path.join(root, 'kotori.yml'))) {
		if (count > 5) throw new KotoriError('cannot find kotori-bot global kotori.yml', 'CoreError');
		root = path.join(root, '..');
		count += 1;
	}

	return {
		root,
		modules: path.join(root, 'modules'),
	};
})();

const checkLangType = (data: unknown): data is langType => {
	if (!data || typeof data !== 'string') return false;
	for (const val of Object.values(LocaleIdentifier)) {
		if (typeof val !== 'string') continue;
		if (val === data) return true;
	}
	return false;
};

/* refactor with configcheck... */
const checkGlobalConfig = (data: unknown): data is GlobalConfigs => {
	if (!data || !isObj(data) || !isObj<obj>(data.global) || !isObj<obj>(data.adapter)) return false;
	if (!checkLangType(data.global.lang)) return false;
	if (!data.global['command-prefix'] || typeof data.global['command-prefix'] !== 'string') return false;
	for (const el of Object.values(data.adapter)) {
		if (!isObj(el)) return false;
		if (typeof el.extend !== 'string' || typeof el.master !== 'number') return false;
		if (el.lang && !checkLangType(el.lang)) return false;
		if (!el.lang) el.lang = data.global.lang;
		if (el['command-prefix'] && typeof el['command-prefix'] !== 'string') return false;
		if (!el['command-prefix']) el['command-prefix'] = data.global['command-prefix'];
	}
	return true;
};

export const globalConfigs: GlobalConfigs = (() => {
	const data = loadConfig(path.join(baseDir.root, 'kotori.yml'), 'yaml');
	if (!checkGlobalConfig(data)) throw new KotoriError('kotori-bot global kotori.yml format error', 'CoreError');
	return data;
})();
