import { DEFAULT_LANG } from '@kotori-bot/i18n'

export const PLUGIN_PREFIX = 'kotori-plugin-'

export const DATABASE_PREFIX = `${PLUGIN_PREFIX}database-`

export const ADAPTER_PREFIX = `${PLUGIN_PREFIX}adapter-`

export const DEFAULT_CORE_CONFIG = {
  global: {
    lang: DEFAULT_LANG,
    'command-prefix': '/'
  },
  adapter: {},
  plugin: {}
}
