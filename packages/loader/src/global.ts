import fs from 'fs';
import path from 'path';
import {
  CoreError,
  CoreConfig,
  TsuError,
  loadConfig,
  obj,
  Tsu,
  localeTypeSchema,
  DEFAULT_CORE_CONFIG
} from '@kotori-bot/core';
import { DEFAULT_LANG } from '../../i18n/src';

export function isDev() {
  return (globalThis as obj).env_mode === 'dev';
}

export const CONFIG_FILE = () => (isDev() ? 'kotori.dev.yml' : 'kotori.yml');

export function getBaseDir() {
  const { env_dir: envDir } = globalThis as obj;
  if (envDir) return { root: envDir, modules: path.join(envDir, 'modules') };
  let root = path.resolve(__dirname, '..').replace('loader', 'kotori');
  let count = 0;
  while (!fs.existsSync(path.join(root, CONFIG_FILE()))) {
    if (count > 5) throw new CoreError(`cannot find kotori-bot global ${CONFIG_FILE()}`);
    root = path.join(root, '..');
    count += 1;
  }
  return { root, modules: path.join(root, 'modules') };
}

export function getCoreConfig(baseDir: CoreConfig['baseDir']) {
  try {
    return Tsu.Object({
      global: Tsu.Object({
        dirs: Tsu.Array(Tsu.String()).default([]),
        lang: localeTypeSchema.default(DEFAULT_LANG),
        'command-prefix': Tsu.String().default(DEFAULT_CORE_CONFIG.config.global['command-prefix'])
      }),
      adapter: Tsu.Object({})
        .index(
          Tsu.Object({
            extends: Tsu.String(),
            master: Tsu.Union([Tsu.Number(), Tsu.String()]),
            lang: localeTypeSchema.optional(),
            'command-prefix': Tsu.String().optional()
          })
        )
        .default({}),
      plugin: Tsu.Object({})
        .index(
          Tsu.Object({
            filter: Tsu.Object({}).default({})
          }).default({ filter: {} })
        )
        .default({})
    })
      .default(DEFAULT_CORE_CONFIG.config)
      .parse(loadConfig(path.join(baseDir.root, CONFIG_FILE()), 'yaml'));
  } catch (err) {
    if (!(err instanceof TsuError)) throw err;
    throw new CoreError(`kotori-bot global ${CONFIG_FILE} format error: ${err.message}`);
  }
}
