import { LoggerLevel } from '@kotori-bot/logger'

export const PLUGIN_PREFIX = 'kotori-plugin-'

export const ADAPTER_PREFIX = 'adapter-'

export const CONFIG_NAME = 'kotori.toml'

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
  dbPrefix: 'romiChan',
  level: LoggerLevel.RECORD,
  noColor: false
}
