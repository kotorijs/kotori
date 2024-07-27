import { LoggerLevel } from '@kotori-bot/logger'

export const CONFIG_NAME = 'kotori.toml'

export const SUPPORTS_VERSION = /(1\.1\.0)|(1\.2\.0)|(1\.(3|4|5|6|7|8|9)\.(.*))/

export const SUPPORTS_HALF_VERSION = /(x\.x\.(.*?))/

export const BUILD_MODE = 'build' as const

export const DEV_MODE = 'dev' as const

export const CORE_MODULES = [
  '@kotori-bot/kotori-plugin-core',
  '@kotori-bot/kotori-plugin-filter'
  // '@kotori-bot/kotori-plugin-webui'
]

export const INTERNAL_PACKAGES = [
  'fluoro',
  'kotori-bot',
  '@kotori-bot/core',
  '@kotori-bot/loader',
  '@kotori-bot/logger',
  '@kotori-bot/i18n',
  '@kotori-bot/tools'
]

export const DEFAULT_LOADER_CONFIG = {
  dirs: ['./node_modules/', './node_modules/@kotori-bot/'],
  port: 720,
  level: LoggerLevel.RECORD,
  noColor: false
}
