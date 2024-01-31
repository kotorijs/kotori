import { join } from 'path';
import { loadConfig } from '@kotori-bot/tools';
import { KotoriConfig as KotoriConfigType, PackageInfo, kotoriConfigSchema, packageInfoSchema } from '../types';
import { CoreError } from '../utils/errror';

type ConfigType = KotoriConfigType & { pkg: PackageInfo };

export class KotoriConfig implements ConfigType {
  readonly pkg: PackageInfo;

  readonly baseDir: KotoriConfigType['baseDir'];

  readonly config: KotoriConfigType['config'];

  readonly options: KotoriConfigType['options'];

  constructor(config?: KotoriConfigType) {
    const info = loadConfig(join(__dirname, '../../package.json')) as unknown;
    if (!info || Object.values(info).length === 0) throw new CoreError('Cannot find kotori-bot package.json');
    const result = packageInfoSchema.parseSafe(info);
    if (!result.value) throw new CoreError(`File package.json format error: ${result.error.message}`);
    this.pkg = result.data;
    const handle = kotoriConfigSchema.parseSafe(config);
    if (!handle.value) throw new CoreError('Unexpected error in parsing config (baseDir,kotori,options)');
    this.baseDir = handle.data.baseDir;
    this.config = handle.data.config;
    this.options = handle.data.options;
  }
}

export default KotoriConfig;
