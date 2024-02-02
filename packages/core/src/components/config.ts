import path from 'path';
import { loadConfig } from '@kotori-bot/tools';
import Tsu from 'tsukiko';
import { DEFAULT_LANG } from '@kotori-bot/i18n';
import { localeTypeSchema } from '../types';
import { CoreError } from '../utils/errror';
import { DEFAULT_COMMAND_PREFIX, DEFAULT_ENV, DEFAULT_MODULES_DIR, DEFAULT_ROOT_DIR } from '../consts';

const packageInfoSchema = Tsu.Object({
  name: Tsu.String(),
  version: Tsu.String(),
  description: Tsu.String(),
  main: Tsu.String(),
  license: Tsu.Literal('GPL-3.0'),
  author: Tsu.String()
});

const defaultBaseDir = {
  root: path.resolve(DEFAULT_ROOT_DIR),
  modules: path.resolve(DEFAULT_MODULES_DIR)
};

const defaultOptions = {
  env: DEFAULT_ENV as typeof DEFAULT_ENV
};

const defaultKotoriConfig = {
  global: {
    dirs: [],
    lang: DEFAULT_LANG,
    'command-prefix': DEFAULT_COMMAND_PREFIX
  },
  adapter: {},
  plugin: {}
};

const adapterConfigBaseSchema = Tsu.Object({
  extends: Tsu.String(),
  master: Tsu.Union([Tsu.Number(), Tsu.String()]),
  lang: localeTypeSchema.optional(),
  'command-prefix': Tsu.String().optional()
});

const moduleConfigBaseSchema = Tsu.Object({
  filter: Tsu.Object({}).default({})
}).default({ filter: {} });

const kotoriConfigSchema = Tsu.Object({
  global: Tsu.Object({
    dirs: Tsu.Array(Tsu.String()).default([]),
    lang: localeTypeSchema.default(DEFAULT_LANG),
    'command-prefix': Tsu.String().default(DEFAULT_COMMAND_PREFIX)
  }),
  adapter: Tsu.Object({}).index(adapterConfigBaseSchema).default({}),
  plugin: Tsu.Object({}).index(moduleConfigBaseSchema).default({})
}).default(defaultKotoriConfig);

const coreConfigSchema = Tsu.Object({
  baseDir: Tsu.Object({
    root: Tsu.String().default(DEFAULT_ROOT_DIR),
    modules: Tsu.String().default(DEFAULT_MODULES_DIR)
  }).default(defaultBaseDir),
  config: kotoriConfigSchema,
  options: Tsu.Object({
    env: Tsu.Union([Tsu.Literal('dev'), Tsu.Literal('build')]).default(DEFAULT_ENV)
  }).default(defaultOptions)
}).default({
  baseDir: defaultBaseDir,
  config: defaultKotoriConfig,
  options: defaultOptions
});

type CoreConfig = Tsu.infer<typeof coreConfigSchema>;

export class Config {
  readonly pkg: Tsu.infer<typeof packageInfoSchema>;

  readonly baseDir: CoreConfig['baseDir'];

  readonly config: CoreConfig['config'];

  readonly options: CoreConfig['options'];

  constructor(config?: CoreConfig) {
    const info = loadConfig(path.join(__dirname, '../../package.json')) as unknown;
    if (!info || Object.values(info).length === 0) throw new CoreError('Cannot find kotori-bot package.json');
    const result = packageInfoSchema.parseSafe(info);
    if (!result.value) throw new CoreError(`File package.json format error: ${result.error.message}`);
    this.pkg = result.data;
    const handle = coreConfigSchema.parseSafe(config);
    if (!handle.value) throw new CoreError('Unexpected error in parsing config (baseDir,kotori,options)');
    this.baseDir = handle.data.baseDir;
    this.config = handle.data.config;
    this.options = handle.data.options;
  }
}

export default Config;
