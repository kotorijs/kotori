import { resolve } from 'node:path'
import type { CoreConfig } from '../types'
import { DEFAULT_CORE_CONFIG } from '../global'

/** Meta information. */
interface MetaInfo {
  /** Program name */
  name: string
  /** Program core version */
  coreVersion: string
  /** Program loader version if exists */
  loaderVersion?: string
  /** Program version if exists */
  version?: string
  /** Program description */
  description: string
  /** Program entry file */
  main: string
  /**
   *  Program license
   *
   *  @constant
   */
  license: 'GPL-3.0'
  /** Program author */
  author: string
}

export class Config {
  public readonly config: CoreConfig

  public readonly meta: MetaInfo

  public constructor(config: Omit<Partial<CoreConfig>, 'global'> & { global?: Partial<CoreConfig['global']> } = {}) {
    this.config = Object.assign(DEFAULT_CORE_CONFIG, config)
    this.config.global = Object.assign(DEFAULT_CORE_CONFIG.global, this.config.global)
    const info: MetaInfo = require(resolve(__dirname, '../../package.json'))
    this.meta = { ...info, coreVersion: info.version as string, version: undefined }
  }
}

export default Config
