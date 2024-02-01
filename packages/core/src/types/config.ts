import Tsu from 'tsukiko';
import { DEFAULT_LANG, DEFAULT_SUPPORTS, LocaleType } from '@kotori-bot/i18n';
import path from 'path';
import { DEFAULT_COMMAND_PREFIX, DEFAULT_ENV, DEFAULT_MODULES_DIR, DEFAULT_ROOT_DIR } from '../consts';

export const localeTypeSchema = Tsu.Custom<LocaleType>(
  (val) => typeof val === 'string' && DEFAULT_SUPPORTS.includes(val as LocaleType)
);

export const packageInfoSchema = Tsu.Object({
  name: Tsu.String(),
  version: Tsu.String(),
  description: Tsu.String(),
  main: Tsu.String(),
  license: Tsu.Literal('GPL-3.0'),
  author: Tsu.String()
});

export type PackageInfo = Tsu.infer<typeof packageInfoSchema>;

export const adapterConfigBaseSchema = Tsu.Object({
  extends: Tsu.String(),
  master: Tsu.Union([Tsu.Number(), Tsu.String()]),
  lang: localeTypeSchema.optional(),
  'command-prefix': Tsu.String().optional()
});

export type AdapterConfig = Tsu.infer<typeof adapterConfigBaseSchema>;

export const moduleConfigBaseSchema = Tsu.Object({
  filter: Tsu.Object({}).default({})
}).default({ filter: {} });

export type ModuleConfig = Tsu.infer<typeof moduleConfigBaseSchema>;

const defaultBaseDir = {
  root: path.resolve(DEFAULT_ROOT_DIR),
  modules: path.resolve(DEFAULT_MODULES_DIR)
};

export const baseDirSchema = Tsu.Object({
  root: Tsu.String().default(DEFAULT_ROOT_DIR),
  modules: Tsu.String().default(DEFAULT_MODULES_DIR)
}).default(defaultBaseDir);

export type BaseDir = Tsu.infer<typeof baseDirSchema>;

const defaultOptions = {
  env: DEFAULT_ENV as typeof DEFAULT_ENV
};

export const optionsSchema = Tsu.Object({
  env: Tsu.Union([Tsu.Literal('dev'), Tsu.Literal('build')]).default(DEFAULT_ENV)
}).default(defaultOptions);

export type Options = Tsu.infer<typeof optionsSchema>;

const defaultConfig = {
  global: {
    dirs: [],
    lang: DEFAULT_LANG,
    'command-prefix': DEFAULT_COMMAND_PREFIX
  },
  adapter: {},
  plugin: {}
};

export const kotoriConfigSchema = Tsu.Object({
  global: Tsu.Object({
    dirs: Tsu.Array(Tsu.String()).default([]),
    lang: localeTypeSchema.default(DEFAULT_LANG),
    'command-prefix': Tsu.String().default(DEFAULT_COMMAND_PREFIX)
  }),
  adapter: Tsu.Object({}).index(adapterConfigBaseSchema).default({}),
  plugin: Tsu.Object({}).index(moduleConfigBaseSchema).default({})
}).default(defaultConfig);

export type KotoriConfig = Tsu.infer<typeof kotoriConfigSchema>;

export const coreConfigSchema = Tsu.Object({
  baseDir: baseDirSchema,
  config: kotoriConfigSchema,
  options: optionsSchema
}).default({
  baseDir: defaultBaseDir,
  config: defaultConfig,
  options: defaultOptions
});

export type CoreConfig = Tsu.infer<typeof coreConfigSchema>;
