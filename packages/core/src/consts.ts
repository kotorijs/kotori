import { DEFAULT_LANG } from '@kotori-bot/i18n';
import path from 'path';

export const OFFICIAL_MODULES_SCOPE = '@kotori-bot/';

export const PLUGIN_PREFIX = 'kotori-plugin-';

export const DATABASE_PREFIX = `${PLUGIN_PREFIX}database-`;

export const ADAPTER_PREFIX = `${PLUGIN_PREFIX}adapter-`;

export const CUSTOM_PREFIX = `${PLUGIN_PREFIX}custom-`;

export const CORE_MODULES = ['@kotori-bot/kotori-plugin-core'];

export const DEFAULT_CORE_CONFIG = {
  baseDir: {
    root: path.resolve('../../'),
    modules: path.resolve('../../', './modules/')
  },
  config: {
    global: {
      dirs: [],
      lang: DEFAULT_LANG,
      'command-prefix': '/'
    },
    adapter: {},
    plugin: {}
  },
  options: {
    env: 'dev' as 'dev'
  }
};
