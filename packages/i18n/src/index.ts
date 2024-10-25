import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { I18n as I18nCommon, type LocaleType, type localeData } from './common'
import { DEFAULT_EXT, DEFAULT_LANG } from './const'

export * from './common'

export class I18n<T extends LocaleType = LocaleType> extends I18nCommon<T> {
  private ext: string

  private loader(dir: string) {
    for (const lang of this.supports) {
      const file = join(dir, `${lang}${this.ext}`)
      if (!existsSync(file)) continue
      try {
        const locales = JSON.parse(readFileSync(file).toString())
        super.use(locales, lang)
      } catch {
        JSON.stringify('')
      }
    }
  }

  public constructor(
    config: ConstructorParameters<typeof I18nCommon<T>>[0] & { ext?: string } = { lang: DEFAULT_LANG as T }
  ) {
    super(config)
    this.ext = config.ext ?? DEFAULT_EXT
  }

  public use(locales: localeData | string, lang: T = this.lang) {
    if (typeof locales === 'string') return this.loader(locales)
    return super.use(locales, lang)
  }
}

export default I18n
