import { join } from 'path';
import { loadConfig } from '@kotori-bot/tools';
import { CoreConfig, PackageInfo, coreConfigSchema, packageInfoSchema } from '../types/index';
import { CoreError } from '../utils/errror';

type ConfigType = CoreConfig & { pkg: PackageInfo };

declare module '../context/index' {
  interface Context {
    readonly pkg: PackageInfo;
    readonly baseDir: CoreConfig['baseDir'];
    readonly config: CoreConfig['config'];
    readonly options: CoreConfig['options'];
  }
}

export class Config implements ConfigType {
  readonly pkg: PackageInfo;

  readonly baseDir: CoreConfig['baseDir'];

  readonly config: CoreConfig['config'];

  readonly options: CoreConfig['options'];

  constructor(config?: CoreConfig) {
    const info = loadConfig(join(__dirname, '../../package.json')) as unknown;
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
