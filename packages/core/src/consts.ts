import { LocaleType } from '@kotori-bot/i18n';

export const OFFICIAL_MODULES_SCOPE = '@kotori-bot/';

export const PLUGIN_PREFIX = 'kotori-plugin-';

export const DATABASE_PREFIX = `${PLUGIN_PREFIX}database-`;

export const ADAPTER_PREFIX = `${PLUGIN_PREFIX}adapter-`;

export const CUSTOM_PREFIX = `${PLUGIN_PREFIX}custom-`;

export const LOAD_MODULE_MAX_TIME = 10 * 1000;

export const LOAD_MODULE_SLEEP_TIME = 150;

export const DEFAULT_LANG: LocaleType = 'en_US';

export const DEFAULT_ROOT_DIR = './';

export const DEFAULT_MODULES_DIR = './modules';

export const DEFAULT_COMMAND_PREFIX = '/';

export const DEFAULT_ENV = 'dev';

export const DEFAULT_PRIORITY = 70;

export const DEFAULT_CUSTOM_PRIORITY = 40;

export const DEFAULT_ADAPTER_PRIORITY = 30;

export const DEFAULT_DATABASE_PRIORITY = 20;

export const DEFAULT_FILTER = {};
