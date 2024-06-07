import { DEFAULT_LANG, DEFAULT_SUPPORTS } from './const';
import LocaleIdentifier from './types/locale';

export * from './types/locale';
export * from './const';

export type LocaleType = keyof typeof LocaleIdentifier;

export interface localeData {
  [propName: string]: string;
}

export class I18n<T extends LocaleType = LocaleType> {
  protected readonly localesData: Map<T, Map<string, string>> = new Map();

  protected lang: T;

  public readonly supports: T[];

  public constructor(config: { supports?: T[]; lang: T } = { lang: DEFAULT_LANG as T }) {
    this.supports = config.supports ?? (DEFAULT_SUPPORTS as T[]);
    this.lang = config.lang;
    this.supports.forEach((locale) => this.localesData.set(locale, new Map()));
  }

  public use(locales: localeData, lang: T = this.lang) {
    Object.keys(locales).forEach((locale) => {
      this.localesData.get(lang)!.set(locale.toLowerCase(), locales[locale]);
    });
  }

  public locale(locale: string, lang: T = this.lang) {
    return (
      this.localesData.get(lang)?.get(locale.toLowerCase()) ??
      this.localesData.get('common' as T)?.get(locale.toLowerCase()) ??
      locale
    );
  }

  public set(lang: T) {
    this.lang = lang;
  }

  public get() {
    return this.lang;
  }

  public extends(lang?: T) {
    const sonInstance: I18n<T> = Object.create(this);
    if (lang) sonInstance.set(lang);
    return sonInstance;
  }

  public date(
    date: Date | number = new Date(),
    style: Intl.DateTimeFormatOptions['dateStyle'] = undefined,
    lang: T = this.lang
  ) {
    return new Intl.DateTimeFormat(LocaleIdentifier[lang], { timeStyle: style }).format(date);
  }

  public time(
    time: Date | number = new Date(),
    style: Intl.DateTimeFormatOptions['timeStyle'] = undefined,
    lang: T = this.lang
  ) {
    return new Intl.DateTimeFormat(LocaleIdentifier[lang], { timeStyle: style }).format(time);
  }

  public period(
    time: Date | number = new Date(),
    style: Intl.DateTimeFormatOptions['dayPeriod'] = undefined,
    lang: T = this.lang
  ) {
    return new Intl.DateTimeFormat(LocaleIdentifier[lang], { dayPeriod: style }).format(time);
  }

  public number(number: number, options?: Intl.NumberFormatOptions, lang: T = this.lang) {
    return new Intl.NumberFormat(LocaleIdentifier[lang], options).format(number);
  }

  public list(list: Iterable<string>, options?: Intl.ListFormatOptions, lang: T = this.lang) {
    return new Intl.ListFormat(LocaleIdentifier[lang], options).format(list);
  }

  public rtime(
    value: number,
    unit: Intl.RelativeTimeFormatUnit,
    options?: Intl.RelativeTimeFormatOptions,
    lang: T = this.lang
  ) {
    return new Intl.RelativeTimeFormat(LocaleIdentifier[lang], options).format(value, unit);
  }

  public segmenter(input: string, options?: Intl.RelativeTimeFormatOptions, lang: T = this.lang) {
    return new Intl.Segmenter(lang, options).segment(input);
  }
}

export default I18n;
