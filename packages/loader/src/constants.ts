export const DEV_FILE = '.ts';

export const BUILD_FILE = '.js';

export const DEV_CODE_DIRS = './src/';

export const DEV_IMPORT = `${DEV_CODE_DIRS}index.ts`;

export const CONFIG_EXT = ['.toml', '.yml', '.yaml', '.json'];

export const BUILD_CONFIG_NAME = 'kotori';

export const DEV_CONFIG_NAME = 'kotori.dev';

export const SUPPORTS_VERSION = /(1\.1\.0)|(1\.2\.0)|(1\.3\.(.*))|(1\.4\.(.*))/;

export const SUPPORTS_HALF_VERSION = /(x\.x\.(.*?))/;

export const BUILD_MODE = 'build' as const;

export const DEV_MODE = 'dev' as const;

export const DEV_SOURCE_MODE = 'dev-source' as const;
