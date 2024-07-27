import { resolve } from 'node:path'
import type { CoreConfig } from '../types'
import { DEFAULT_CORE_CONFIG } from '../global'

interface MetaInfo {
  name: string
  coreVersion: string
  loaderVersion?: string
  version?: string
  description: string
  main: string
  license: 'GPL-3.0'
  author: string
}

export class Config {
  public readonly config: CoreConfig

  public readonly meta: MetaInfo

  public constructor(config: Omit<Partial<CoreConfig>, 'global'> & { global?: Partial<CoreConfig['global']> } = {}) {
    this.config = Object.assign(DEFAULT_CORE_CONFIG, config)
    this.config.global = Object.assign(DEFAULT_CORE_CONFIG.global, this.config.global)
    /* load package.json */
    // const info = loadConfig(resolve(__dirname, '../../package.json')) as unknown as MetaInfo
    // if (!info || Object.values(info).length === 0) {
    //   process.stderr.write('Cannot find kotori-bot package.json\n')
    //   process.exit()
    // }
    // const result = packageInfoSchema.parse(info)
    // if (!result.value) {
    //   process.stderr.write(`File package.json format error: ${result.error.message}\n`)
    //   process.exit()
    // }
    const info: MetaInfo = require(resolve(__dirname, '../../package.json'))
    info.coreVersion = info.version as string
    // biome-ignore lint:
    delete info.version
    this.meta = info
  }
}

export default Config
