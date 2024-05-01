import { DEFAULT_LANG } from '@kotori-bot/i18n';

export const OFFICIAL_MODULES_SCOPE = '@kotori-bot/';

export const PLUGIN_PREFIX = 'kotori-plugin-';

export const DATABASE_PREFIX = `${PLUGIN_PREFIX}database-`;

export const ADAPTER_PREFIX = `${PLUGIN_PREFIX}adapter-`;

export const CUSTOM_PREFIX = `${PLUGIN_PREFIX}custom-`;

export const DEFAULT_PORT = 720;

export const DEFAULT_CORE_CONFIG = {
  global: {
    lang: DEFAULT_LANG,
    'command-prefix': '/',
    port: DEFAULT_PORT
  },
  adapter: {},
  plugin: {}
};
