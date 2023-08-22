import path from 'path';
import { existsSync } from 'fs';
import { CONST, isObj, loadConfig, saveConfig } from '../function';
import { LocaleIdentifier, obj } from '../type';

export class Locale {
	public static register = (dirPath: string) => {
		if (!this.localeConfigPath) this.localeConfigPath = path.join(CONST.CONFIG_PATH, 'i18n.json');
		if (!this.isGetLocale) this.getLocale();
		const newDirPath = path.join(dirPath, 'locales');
		if (!existsSync(newDirPath)) return false;
		this.localePathList.push(newDirPath);
		return this.loader(newDirPath);
	};

	public static locale = (val: string) => {
		const result = val in this.localeDataList ? this.localeDataList[val] : val;
		return result;
	};

	public static setlang = (val: keyof typeof LocaleIdentifier) => {
		const result = {
			language: val,
		};
		saveConfig(this.localeConfigPath, result);
		this.getLocale();
		return this.reload();
	};

	private static localeDataList: obj<string> = {};

	private static localePathList: string[] = [];

	private static defaultLang: LocaleIdentifier = LocaleIdentifier.en_US;

	private static useLang: keyof typeof LocaleIdentifier = LocaleIdentifier[
		this.defaultLang
	] as keyof typeof LocaleIdentifier;

	private static localeConfigPath = '';

	private static isGetLocale = false;

	private static loader = (dirPath: string) => {
		const filePath = path.join(dirPath, `${this.useLang}.json`);
		const localeData = loadConfig(filePath, 'json', {});
		if (!isObj(localeData, '')) return false;
		this.localeDataList = { ...this.localeDataList, ...localeData };
		return true;
	};

	private static reload = () => {
		let totalNum = 0;
		let successNum = 0;
		this.localePathList.forEach(dir => {
			totalNum += 1;
			if (this.loader(dir)) successNum += 1;
		});
		return [totalNum, successNum];
	};

	private static checkLocaleIdentifier = (val: string): val is keyof typeof LocaleIdentifier => {
		const result = Object.values(LocaleIdentifier).includes(val);
		return result;
	};

	private static getLocale = () => {
		const result = loadConfig(this.localeConfigPath);
		if (!result || !isObj(result) || Array.isArray(result)) return;
		if (!result?.language || typeof result.language !== 'string') return;
		if (!this.checkLocaleIdentifier(result.language)) return;
		this.useLang = result.language;
		this.isGetLocale = true;
	};
}

export default Locale;
