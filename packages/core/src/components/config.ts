import Tsu from 'tsukiko'
import { resolve } from 'node:path'
import { loadConfig } from '@kotori-bot/tools'
import type { CoreConfig } from '../types'
import { DEFAULT_CORE_CONFIG } from '../global'

// const packageInfoSchema = Tsu.Object({
//   name: Tsu.String(),
//   version: Tsu.String(),
//   description: Tsu.String(),
//   main: Tsu.String(),
//   license: Tsu.Literal('GPL-3.0'),
//   author: Tsu.String()
// })

// to interface

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

  public constructor(config: CoreConfig = DEFAULT_CORE_CONFIG) {
    this.config = config
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
    info.coreVersion = info.version!
    delete info.version
    this.meta = info
  }
}

export default Config
