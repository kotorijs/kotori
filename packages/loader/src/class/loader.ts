/*
 * @Author: hotaru biyuehuya@gmail.com
 * @Blog: https://hotaru.icu
 * @Date: 2023-06-24 15:12:55
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2024-07-29 15:47:36
 */
import {
  KotoriError,
  Tsu,
  type AdapterConfig,
  type CoreConfig,
  Symbols,
  DEFAULT_CORE_CONFIG,
  loadConfig,
  TsuError,
  Core,
  type Context,
  ModuleError,
  formatFactory,
  Http,
  configFileType
} from '@kotori-bot/core'
import path from 'node:path'
import fs from 'node:fs'
import Logger, { LoggerLevel } from '@kotori-bot/logger'
import Runner, { localeTypeSchema } from './runner'
import loadInfo from '../utils/log'
import {
  CONFIG_NAME,
  BUILD_MODE,
  SUPPORTS_HALF_VERSION,
  SUPPORTS_VERSION,
  DEFAULT_LOADER_CONFIG,
  DEV_MODE
} from '../constants'
import Server from '../service/server'
import type Database from '../service/database'
import File from '../service/file'

declare module '@kotori-bot/core' {
  interface Context {
    readonly baseDir: Runner['baseDir']
    readonly options: Runner['options']
    readonly [Symbols.modules]: Runner[typeof Symbols.modules]
    loadAll(): void
    watcher(): void
    logger: Logger
    /* Service */
    server: Server
    db: Database
    file: File
    /* Tool */
    format: ReturnType<typeof formatFactory>
    locale: Context['i18n']['locale']
  }

  interface GlobalConfig {
    dirs: string[]
    port: number
    level: number
    noColor: boolean
  }
}

interface LoaderOptions {
  mode: typeof DEV_MODE | typeof BUILD_MODE
  isDaemon?: boolean
  dir?: string
  config?: string
  port?: number
  level?: number
  noColor?: boolean
}

const GLOBAL = {
  REPO: 'https://github.com/kotorijs/kotori',
  UPDATE: 'https://hotaru.icu/api/agent/?url=https://raw.githubusercontent.com/kotorijs/kotori/master/package.json'
}

function getBaseDir(filename: string, dir?: string) {
  let root = dir ? path.resolve(dir) : path.resolve(__dirname, '..').replace('loader', 'kotori')
  let count = 0
  let isFound = false

  while (!isFound) {
    if (count > 5) {
      Logger.fatal(`cannot find file ${filename} `)
      process.exit()
    }

    if (fs.existsSync(path.join(root, filename))) {
      isFound = true
      break
    }

    count += 1
    root = path.resolve(root, '..')
  }

  const baseDir = {
    root,
    data: path.join(root, 'data'),
    logs: path.join(root, 'logs'),
    config: filename
  }

  for (const [key, val] of Object.entries(baseDir)) {
    if (['modules', 'config'].includes(key)) continue
    if (!fs.existsSync(val)) fs.mkdirSync(val)
  }

  return baseDir
}

function getConfig(baseDir: Runner['baseDir'], loaderOptions?: LoaderOptions) {
  try {
    let ext = baseDir.config.split('.').pop()
    if (!ext || ext === 'txt' || !configFileType.includes(ext as 'json')) ext = 'json'

    const result = Tsu.Object({
      global: Tsu.Object({
        lang: localeTypeSchema.default(DEFAULT_CORE_CONFIG.global.lang),
        'command-prefix': Tsu.String().default(DEFAULT_CORE_CONFIG.global['command-prefix']),
        dirs: Tsu.Array(Tsu.String()).default(DEFAULT_LOADER_CONFIG.dirs),
        level: Tsu.Number().default(DEFAULT_LOADER_CONFIG.level),
        port: Tsu.Number().default(DEFAULT_LOADER_CONFIG.port),
        noColor: Tsu.Boolean().default(DEFAULT_LOADER_CONFIG.noColor)
      }).default(Object.assign(DEFAULT_CORE_CONFIG.global, DEFAULT_LOADER_CONFIG)),
      plugin: Tsu.Object({})
        .index(
          Tsu.Object({
            filter: Tsu.Object({}).default({})
          }).default({ filter: {} })
        )
        .default(DEFAULT_CORE_CONFIG.plugin)
    })
      .default({
        global: Object.assign(DEFAULT_CORE_CONFIG.global, DEFAULT_LOADER_CONFIG),
        plugin: DEFAULT_CORE_CONFIG.plugin
      })
      .parse(loadConfig(path.join(baseDir.root, baseDir.config), ext as 'json')) as CoreConfig

    /* Merge loader options */
    // priority: options (Cli args > Env variables) > baseDir (config file) > default
    if (loaderOptions?.level !== undefined) result.global.level = loaderOptions.level
    if (loaderOptions?.port !== undefined) result.global.port = loaderOptions.port
    if (loaderOptions?.noColor !== undefined) result.global.noColor = loaderOptions.noColor
    if (result.global.dirs.length === 0) result.global.dirs = DEFAULT_LOADER_CONFIG.dirs
    if (loaderOptions?.mode === DEV_MODE) {
      // Base on running mode auto set logger level
      if (result.global.level === DEFAULT_LOADER_CONFIG.level) result.global.level = LoggerLevel.DEBUG
      if (!result.global.dirs.includes('modules')) result.global.dirs = ['modules', ...result.global.dirs]
    }

    return Tsu.Object({
      adapter: Tsu.Object({})
        .index(
          Tsu.Object({
            extends: Tsu.String(),
            master: Tsu.Union(Tsu.Number(), Tsu.String()),
            lang: localeTypeSchema.default(result.global.lang),
            'command-prefix': Tsu.String().default(result.global['command-prefix'])
          })
        )
        .default(DEFAULT_CORE_CONFIG.adapter)
    }).parse(result) as CoreConfig
  } catch (err) {
    if (!(err instanceof TsuError)) throw err
    Logger.fatal(`file ${baseDir.config} format error: ${err.message}`)
    process.exit()
  }
}

export class Loader {
  private loadCount = 0

  public readonly ctx: Context

  public constructor(loaderOptions?: LoaderOptions) {
    const baseDir = getBaseDir(loaderOptions?.config || CONFIG_NAME, loaderOptions?.dir)
    const options = { mode: loaderOptions?.mode || BUILD_MODE, isDaemon: !!loaderOptions?.isDaemon }

    this.ctx = new Core(getConfig(baseDir, options))
    this.ctx.root.meta.loaderVersion = require(path.resolve(__dirname, '../../package.json')).version
    this.ctx.provide('runner', new Runner(this.ctx, { baseDir, options }))
    this.ctx.mixin('runner', ['baseDir', 'options'])
    this.ctx.provide('loader-tools', {
      format: formatFactory(this.ctx.i18n),
      locale: this.ctx.i18n.locale.bind(this.ctx.i18n)
    })
    this.ctx.mixin('loader-tools', ['locale', 'format'])
    this.ctx.i18n.use(path.resolve(__dirname, '../../locales'))

    this.ctx.logger.trace('loaderOptions:', options)
    this.ctx.logger.trace('baseDir:', this.ctx.baseDir)
    this.ctx.logger.trace('options:', this.ctx.options)
    this.ctx.logger.trace('config:', this.ctx.config)
    this.ctx.logger.trace('where:', __dirname, __filename)
    this.ctx.logger.trace('running:', process.cwd())
  }

  public run() {
    loadInfo(this.ctx.meta, this.ctx)
    this.catchError()
    this.listenMessage()
    this.setPreService()
    this.loadAllModules()
    this.checkUpdate()
  }

  private handleError(err: Error | unknown, prefix: string) {
    if (!(err instanceof KotoriError)) {
      if (err instanceof Error) {
        this.ctx.logger.label(prefix).error(err.message, err.stack)
      } else {
        this.ctx.logger.label(prefix).error(err)
      }
      return
    }

    const list = {
      ServiceError: () => this.ctx.logger.label('service').warn,
      ModuleError: () => this.ctx.logger.label('module').error,
      UnknownError: () => this.ctx.logger.error,
      DevError: () => this.ctx.logger.label('error').debug
    }
    list[err.name]().bind(this.ctx.logger)(err.message, err.stack)
  }

  private catchError() {
    // process.on('uncaughtExceptionMonitor', (err) => this.handleError(err, 'sync'))
    process.on('unhandledRejection', (err) => this.handleError(err, 'async'))
    process.on('uncaughtException', (err) => this.handleError(err, 'sync'))
    process.on('SIGINT', () => process.exit())
    if (this.ctx.options.mode === DEV_MODE) this.ctx.locale('loader.debug.info')
  }

  private listenMessage() {
    this.ctx.on('connect', (data) => {
      const { type, mode, normal, address: addr, adapter } = data
      let msg: string
      if (type === 'connect') {
        switch (mode) {
          case 'ws':
            msg = this.ctx.format(`loader.bots.${normal ? 'connect' : 'reconnect'}`, [addr])
            break
          case 'ws-reverse':
            msg = this.ctx.format(`loader.bots.${normal ? 'start' : 'restart'}`, [addr])
            break
          default:
            msg = this.ctx.format('loader.bots.ready', [addr])
        }
      } else {
        switch (mode) {
          case 'ws':
            msg = this.ctx.format(`loader.bots.disconnect${normal ? '' : '.error'}`, [addr])
            break
          case 'ws-reverse':
            msg = this.ctx.format(`loader.bots.stop${normal ? '' : '.error'}`, [addr])
            break
          default:
            msg = this.ctx.format('loader.bots.dispose', [addr])
        }
      }
      adapter.ctx.logger[normal ? 'info' : 'warn'](msg)
    })
    this.ctx.on('status', ({ status, adapter }) => adapter.ctx.logger.info(status))
    this.ctx.on('ready_module', (data) => {
      if (typeof data.instance !== 'object') return

      const pkg = data.instance.name
        ? this.ctx.get<Runner>('runner')[Symbols.modules].get(data.instance.name)
        : undefined
      if (!pkg) return

      this.loadCount += 1
      const { name, version, author, peerDependencies } = pkg[0].pkg
      this.ctx.logger.info(
        this.ctx.format('loader.modules.load', [name, version, Array.isArray(author) ? author.join(',') : author])
      )

      const requiredVersion = peerDependencies['kotori-bot']
      if (
        requiredVersion.includes('workspace') ||
        SUPPORTS_VERSION.exec(requiredVersion) ||
        requiredVersion.includes(this.ctx.meta.coreVersion)
      )
        return
      if (SUPPORTS_HALF_VERSION.exec(requiredVersion)) {
        this.ctx.logger.warn(this.ctx.format('loader.modules.incomplete', [requiredVersion]))
      } else {
        this.ctx.logger.error(this.ctx.format('loader.modules.unsupported', [requiredVersion]))
      }
    })
  }

  private setPreService() {
    this.ctx.service('server', new Server(this.ctx.extends(), { port: this.ctx.config.global.port }))
    this.ctx.service('file', new File(this.ctx.extends()))
  }

  private loadAllModules() {
    this.ctx.get<Runner>('runner').loadAll()
    const failLoadCount = this.ctx.get<Runner>('runner')[Symbols.modules].size - this.loadCount
    this.ctx.logger.info(
      this.ctx.format(`loader.modules.all${failLoadCount > 0 ? '.failed' : ''}`, [this.loadCount, failLoadCount])
    )
    this.loadAllAdapter()
    this.ctx.emit('ready')
  }

  private loadAllAdapter() {
    const adapters = this.ctx[Symbols.adapter]
    for (const identity of Object.keys(this.ctx.config.adapter)) {
      const botConfig = this.ctx.config.adapter[identity]
      const array = adapters.get(botConfig.extends)

      if (!array)
        return this.ctx.logger.warn(this.ctx.format('loader.adapters.notfound', [botConfig.extends, identity]))

      const result = array[1]?.parseSafe(botConfig)
      if (result && !result.value)
        throw new ModuleError(this.ctx.format('error.module.config_bot', [identity, result.error.message]))

      const bot = new array[0](
        this.ctx.extends({}, `${botConfig.extends}/${identity}`),
        result ? (result.data as AdapterConfig) : botConfig,
        identity
      )

      const bots = this.ctx[Symbols.bot].get(bot.platform)
      if (bots) bots.add(bot.api)
      else this.ctx[Symbols.bot].set(bot.platform, new Set([bot.api]))

      this.ctx.on('ready', () => bot.start())
      this.ctx.on('dispose', () => bot.stop())
    }
  }

  private async checkUpdate() {
    const { version } = this.ctx.meta
    if (!version) return
    const res = await new Http().get(GLOBAL.UPDATE).catch(() => {})
    if (!res || !Tsu.Object({ version: Tsu.String() }).check(res)) {
      console.log('1')
      this.ctx.logger.warn(this.ctx.locale('loader.tips.update.failed'))
    } else if (version === res.version) {
      this.ctx.logger.info(this.ctx.locale('loader.tips.update.latest'))
    } else {
      this.ctx.logger.warn(this.ctx.format('loader.tips.update.available', [version, res.version, GLOBAL.REPO]))
    }
  }
}

export default Loader
