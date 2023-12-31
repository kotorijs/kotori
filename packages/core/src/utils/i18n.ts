import { LocaleIdentifier, Locale as LocaleOrigin, LocaleType } from '@kotori-bot/i18n';
import path from 'path';
import { loadConfig } from '@kotori-bot/tools';
import { existsSync, statSync } from 'fs';
import Tsu from 'tsukiko';

export * from '@kotori-bot/i18n';

export class Locale {
	private readonly instance: LocaleOrigin;

	public readonly locale: LocaleOrigin['locale'];

	public readonly set: LocaleOrigin['set'];

	public readonly get: LocaleOrigin['get'];

	public constructor(lang: LocaleType = 'en_US') {
		this.instance = new LocaleOrigin(lang);
		this.locale = (val, lang?) => this.instance.locale(val, lang);
		this.set = lang => this.instance.set(lang);
		this.get = () => this.instance.get();
	}

	private localePathList: string[] = [];

	private loader(dirPath: string) {
		let state = true;
		Object.values(LocaleIdentifier).forEach(type => {
			if (typeof type !== 'string') return;
			const locales = loadConfig(path.join(dirPath, `${type}.json`), 'json');
			if (!Tsu.Object({}).index(Tsu.String()).check(locales)) {
				state = false;
				return;
			}
			this.instance.use({ type: type as LocaleType, locales });
		});
		return state;
	}

	public use(data: Parameters<typeof this.instance.use>[0] | string) {
		if (typeof data !== 'string') {
			this.instance.use(data);
			return true;
		}
		if (!existsSync(data) || !statSync(data).isDirectory()) return false;
		this.localePathList.push(data);
		return this.loader(data);
	}
}

export default Locale;
