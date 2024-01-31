import { loadConfig, obj } from '@kotori-bot/tools';
import path from 'path';
import { Parser } from 'tsukiko';
import { DEFAULT_LANG } from '@kotori-bot/i18n';
import {
  type BaseDir,
  type GlobalConfig,
  type GlobalOptions,
  type KotoriConfig,
  type PackageInfo,
  packageInfoSchema,
  kotoriConfigSchema,
  type ServiceClass
} from '../types2';
import type Api from '../components/api';
import { CoreError } from '../utils/errror';
import { DEFAULT_COMMAND_PREFIX, DEFAULT_ENV, DEFAULT_MODULES_DIR, DEFAULT_ROOT_DIR } from '../consts';

export const defaultConfig = {
  baseDir: {
    root: path.resolve(DEFAULT_ROOT_DIR),
    modules: path.resolve(DEFAULT_MODULES_DIR)
  },
  config: {
    global: {
      lang: DEFAULT_LANG,
      'command-prefix': DEFAULT_COMMAND_PREFIX
    },
    adapter: {}
  },
  options: {
    env: DEFAULT_ENV
  }
};

export class Core {
  protected readonly serviceStack: obj<[ServiceClass, Parser<unknown>?]> = {};

  protected readonly botStack: obj<Api[]> = {};

  readonly baseDir: BaseDir;

  readonly config: GlobalConfig;

  readonly options: GlobalOptions;

  readonly package: PackageInfo;

  constructor(config?: KotoriConfig) {
    const info = loadConfig(path.join(__dirname, '../../package.json')) as unknown;
    if (!info || Object.values(info).length === 0) throw new CoreError('Cannot find kotori-bot package.json');
    const result = packageInfoSchema.parseSafe(info);
    if (!result.value) throw new CoreError(`File package.json format error: ${result.error.message}`);
    this.package = result.data;
    const handle = kotoriConfigSchema.parseSafe(config);
    if (!handle.value) throw new CoreError('Unexpected error in parsing config (basedir,kotori,options)');
    this.baseDir = handle.data!.baseDir;
    this.config = handle.data!.config;
    this.options = handle.data!.options;
  }
}

export default Core;
