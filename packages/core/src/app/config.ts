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
    this.config = { ...DEFAULT_CORE_CONFIG, ...config } as CoreConfig
    this.config.global = { ...DEFAULT_CORE_CONFIG.global, ...this.config.global }
    const pkg =
      typeof require === 'function'
        ? require('../../package.json')
        : {
            name: '@kotori-bot/core',
            version: 'BROWSER',
            description: '',
            author: 'Arimura Sena <me@hotaru.icu>',
            main: 'lib/index.js'
          }
    this.meta = {
      name: pkg.name,
      description: pkg.description,
      main: pkg.main,
      license: 'GPL-3.0',
      author: pkg.author,
      coreVersion: pkg.version
    }
    ;(globalThis as unknown as { kotori: object }).kotori = this.meta
  }
}

export default Config
