import fs from 'fs';
import path from 'path';
import { BaseDir, CoreError, CoreConfig, TsuError, kotoriConfigSchema, loadConfig, obj } from '@kotori-bot/core';

/* global globalThis */
export const isDev = () => (globalThis as obj).env_mode === 'dev';

export const CONFIG_FILE = () => (isDev() ? 'kotori.dev.yml' : 'kotori.yml');

export const getBaseDir = () => {
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
};

export const getCoreConfig = (baseDir: BaseDir) => {
  try {
    return kotoriConfigSchema.parse(loadConfig(path.join(baseDir.root, CONFIG_FILE()), 'yaml'));
  } catch (err) {
    if (!(err instanceof TsuError)) throw err;
    // process.exit(1);
    throw new CoreError(`kotori-bot global ${CONFIG_FILE} format error: ${err.message}`);
  }
};
