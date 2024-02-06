import Tsu from 'tsukiko';
import { join } from 'path';
import { loadConfig } from '@kotori-bot/tools';
import { CoreConfig } from '../types';
import { DEFAULT_CORE_CONFIG } from '../consts';

const packageInfoSchema = Tsu.Object({
  name: Tsu.String(),
  version: Tsu.String(),
  description: Tsu.String(),
  main: Tsu.String(),
  license: Tsu.Literal('GPL-3.0'),
  author: Tsu.String()
});

export class Config {
  readonly config: CoreConfig;

  readonly pkg: Tsu.infer<typeof packageInfoSchema>;

  constructor(config: CoreConfig = DEFAULT_CORE_CONFIG) {
    this.config = config;
    /* load package.json */
    const info = loadConfig(join(__dirname, '../../package.json')) as unknown;
    if (!info || Object.values(info).length === 0) {
      process.stderr.write(`Cannot find kotori-bot package.json\n`);
      process.exit();
    }
    const result = packageInfoSchema.parseSafe(info);
    if (!result.value) {
      process.stderr.write(`File package.json format error: ${result.error.message}\n`);
      process.exit();
    }
    this.pkg = result.data;
  }
}

export default Config;
