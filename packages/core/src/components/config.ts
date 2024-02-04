import path from 'path';
import { loadConfig } from '@kotori-bot/tools';
import Tsu from 'tsukiko';
import { LocaleType } from '@kotori-bot/i18n';
import { EventDataTargetId } from '../types';
import { CoreError } from '../utils/errror';
import { DEFAULT_CORE_CONFIG } from '../consts';

const packageInfoSchema = Tsu.Object({
  name: Tsu.String(),
  version: Tsu.String(),
  description: Tsu.String(),
  main: Tsu.String(),
  license: Tsu.Literal('GPL-3.0'),
  author: Tsu.String()
});

interface KotoriConfig {
  global: {
    dirs: string[];
    lang: LocaleType;
    'command-prefix': string;
  };
  adapter: {
    [propName: string]: {
      extends: string;
      master: EventDataTargetId;
      lang: LocaleType;
      'command-prefix': string;
    };
  };
  plugin: {
    [propName: string]: {
      filter: object;
    };
  };
}

interface CoreConfig {
  baseDir: {
    root: string;
    modules: string;
  };
  config: KotoriConfig;
  options: {
    env: 'dev' | 'build';
  };
}

export class Config {
  readonly pkg: Tsu.infer<typeof packageInfoSchema>;

  readonly baseDir: CoreConfig['baseDir'];

  readonly config: CoreConfig['config'];

  readonly options: CoreConfig['options'];

  constructor(config: CoreConfig = DEFAULT_CORE_CONFIG) {
    const info = loadConfig(path.join(__dirname, '../../package.json')) as unknown;
    if (!info || Object.values(info).length === 0) throw new CoreError('Cannot find kotori-bot package.json');
    const result = packageInfoSchema.parseSafe(info);
    if (!result.value) throw new CoreError(`File package.json format error: ${result.error.message}`);
    this.pkg = result.data;
    this.baseDir = config.baseDir;
    this.config = config.config;
    this.options = config.options;
  }
}

export default Config;
