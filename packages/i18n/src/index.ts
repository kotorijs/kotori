export enum LocaleIdentifier {
	ja_JP,
	en_US,
	zh_TW,
	zh_CN,
}

export type LocaleType = keyof typeof LocaleIdentifier;

export interface localeData {
	[propName: string]: string;
}

export type LocaleDataList = {
	[K in LocaleType]: localeData;
};

export class Locale {
	private readonly localeDataList: LocaleDataList = {
		ja_JP: {},
		en_US: {},
		zh_TW: {},
		zh_CN: {},
	};

	private lang: LocaleIdentifier;

	public constructor(type: LocaleType = 'en_US') {
		this.lang = LocaleIdentifier[type];
	}

	public use(data: { type: LocaleType; locales: localeData }) {
		Object.keys(this.localeDataList[data.type]).forEach(locale => {
			if (!(locale in data.locales)) return;
			delete this.localeDataList[data.type][locale];
		});
		this.localeDataList[data.type] = Object.assign(this.localeDataList[data.type], data.locales);
	}

	public locale(val: string, type: LocaleType = LocaleIdentifier[this.lang] as LocaleType) {
		if (!(type in this.localeDataList)) return val;
		return val in this.localeDataList[type] ? this.localeDataList[type][val] : val;
	}

	public set(lang: LocaleType) {
		this.lang = LocaleIdentifier[lang];
	}

	public get() {
		return this.lang;
	}
}

export default Locale;
