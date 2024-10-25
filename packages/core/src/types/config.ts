import type { LocaleType } from '@kotori-bot/i18n'
import type { ModuleConfig } from 'fluoro'

export interface CoreConfig {
  global: GlobalConfig
  adapter: {
    [propName: string]: AdapterConfig
  }
  plugin: {
    [propName: string]: ModuleConfig
  }
}

export interface GlobalConfig {
  lang: LocaleType
  commandPrefix: string
}

export interface AdapterConfig {
  extends: string
  master: string
  lang: LocaleType
  commandPrefix: string
}
