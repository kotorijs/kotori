import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { I18n as I18nCommon, LocaleType, localeData } from './common';
import { DEFAULT_EXT, DEFAULT_LANG } from './const';

export * from './common';

export class I18n<T extends LocaleType = LocaleType> extends I18nCommon<T> {
  private ext: string;

  private loader(dir: string) {
    this.supports.forEach((lang) => {
      const file = join(dir, `${lang}${this.ext}`);
      if (!existsSync(file)) return;
      try {
        const locales = JSON.parse(readFileSync(file).toString());
        this.use(locales, lang);
      } catch {
        JSON.stringify('');
      }
    });
  }

  constructor(config: ClassParameters<typeof I18nCommon<T>>[0] & { ext?: string } = { lang: DEFAULT_LANG as T }) {
    super(config);
    this.ext = config.ext ?? DEFAULT_EXT;
  }

  use(locales: localeData | string, lang: T = this.lang) {
    if (typeof locales === 'string') {
      this.loader(locales);
      return;
    }
    Object.keys(locales).forEach((locale) => {
      this.localesData.get(lang!)!.set(locale, locales[locale]);
    });
  }
}

export default I18n;
