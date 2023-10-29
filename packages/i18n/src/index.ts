import path from 'path';
import { existsSync, statSync } from 'fs';
import { isObj, loadConfig, obj } from '@kotori-bot/tools';

export type langType = keyof typeof LocaleIdentifier;

export enum LocaleIdentifier {
	ja_JP,
	en_US,
	zh_TW,
	zh_CN,
}

export class Locale {
	private readonly localeDataList: obj<obj<string>> = {
		ja_JP: {},
		en_US: {},
		zh_TW: {},
		zh_CN: {},
	};

	private readonly localePathList: string[] = [];

	private langing: LocaleIdentifier = LocaleIdentifier.en_US;

	private readonly loader = (dirPath: string) => {
		let state = false;
		Object.values(LocaleIdentifier).forEach(target => {
			if (typeof target !== 'string') return;
			const localeData = loadConfig(path.join(dirPath, `${target}.json`), 'json');
			if (!isObj<string>(localeData)) return;
			this.localeDataList[target] = Object.assign(this.localeDataList[target], localeData);
			state = true;
		});
		return state;
	};

	public constructor(uselang?: langType) {
		if (uselang) this.langing = LocaleIdentifier[uselang];
	}

	public readonly uselang = (dir: string) => {
		if (!existsSync(dir) || !statSync(dir).isDirectory()) return false;
		this.localePathList.push(dir);
		return this.loader(dir);
	};

	public readonly locale = (val: string, lang: langType = LocaleIdentifier[this.langing] as langType) => {
		if (!(lang in this.localeDataList)) return val;
		return val in this.localeDataList[lang] ? this.localeDataList[lang][val] : val;
	};

	public readonly setlang = (lang: langType) => {
		this.langing = LocaleIdentifier[lang];
	};
}

export default Locale;
