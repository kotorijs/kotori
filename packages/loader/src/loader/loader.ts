/*
 * @Author: hotaru biyuehuya@gmail.com
 * @Blog: https://hotaru.icu
 * @Date: 2023-06-24 15:12:55
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2024-08-16 11:13:22
 */
// import '@kotori-bot/core/src/utils/internal'
import {
  KotoriError,
  Tsu,
  type AdapterConfig,
  type CoreConfig,
  Symbols,
  DEFAULT_CORE_CONFIG,
  loadConfig,
  TsuError,
  ModuleError,
  formatFactory,
  Http,
  configFileType,
  Core,
  type LocaleType,
  type ModuleConfig,
  DevError,
  Adapter,
  Parser,
  Service,
  Decorators
} from '@kotori-bot/core'
import path from 'node:path'
import fs from 'node:fs'
import Logger, { ConsoleTransport, FileTransport, LoggerLevel } from '@kotori-bot/logger'
import loadInfo from '../utils/log'
import {
  CONFIG_NAME,
  BUILD_MODE,
  DEFAULT_LOADER_CONFIG,
  DEV_MODE,
  ADAPTER_PREFIX,
  CORE_MODULES,
  PLUGIN_PREFIX,
  INTERNAL_PACKAGES
} from './constants'
import Server from '../service/server'
import Database from '../service/database'
import File from '../service/file'
import KotoriLogger from '../utils/logger'
import type Browser from '../service/browser'

interface BaseDir {
  root: string
  data: string
  logs: string
  config: string
}

interface Options {
  mode: typeof BUILD_MODE | typeof DEV_MODE
  isDaemon: boolean
}

export interface ModulePackage {
  name: string
  version: string
  description: string
  main: string
  keywords: string[]
  license: 'GPL-3.0' | 'BCU'
  author: string | string[]
  peerDependencies?: {
    'kotori-bot': string
    [propName: string]: string
  }
  devDependencies?: {
    'rescript-kotori': string
    [propName: string]: string
  }
  kotori: {
    enforce?: 'pre' | 'post'
    meta: {
      language: LocaleType[]
    }
  }
}

export interface ModuleMeta {
  pkg: ModulePackage
  files: string[]
  main: string
}

interface LoaderOptions {
  mode: typeof DEV_MODE | typeof BUILD_MODE
  isDaemon?: boolean
  dir?: string
  config?: string
  port?: number
  dbPrefix?: string
  level?: number
  noColor?: boolean
}

declare module '@kotori-bot/core' {
  interface Context {
    readonly baseDir: BaseDir
    readonly options: Options
    readonly [Symbols.modules]: Loader[typeof Symbols.modules]
    logger: Logger
    /* Service */
    server: Server
    db: Database
    file: File
    browser: Browser
  }

  interface GlobalConfig {
    dirs: string[]
    port: number
    dbPrefix: string
    level: number
    noColor: boolean
  }
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

function getConfig(baseDir: BaseDir, loaderOptions?: LoaderOptions) {
  try {
    let ext = baseDir.config.split('.').pop()
    if (!ext || ext === 'txt' || !configFileType.includes(ext as 'json')) ext = 'json'

    const result = Tsu.Object({
      global: globalLoaderConfigSchema,
      plugin: Tsu.Object({}).index(Tsu.Object({}).default({})).default(DEFAULT_CORE_CONFIG.plugin)
    })
      .default({
        global: Object.assign(DEFAULT_CORE_CONFIG.global, DEFAULT_LOADER_CONFIG),
        plugin: DEFAULT_CORE_CONFIG.plugin
      })
      .parse(loadConfig(path.join(baseDir.root, baseDir.config), ext as 'json'))

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
        .index(adapterConfigSchemaFactory(result.global.lang, result.global.commandPrefix))
        .default(DEFAULT_CORE_CONFIG.adapter)
    }).parse(result) as CoreConfig
  } catch (err) {
    if (!(err instanceof TsuError)) throw err
    Logger.fatal(`file ${baseDir.config} format error: ${err.message}`)
    process.exit()
  }
}

function moduleLoaderOrder(pkg: ModulePackage) {
  if (CORE_MODULES.includes(pkg.name)) return 1
  // if (pkg.name.includes(DATABASE_PREFIX)) return 2
  if (pkg.kotori.enforce === 'pre') return 3
  if (pkg.name.includes(ADAPTER_PREFIX)) return 4
  if (!pkg.kotori.enforce) return 5
  return 6
}

export const localeTypeSchema = Tsu.Union(Tsu.Literal('en_US'), Tsu.Literal('ja_JP'), Tsu.Literal('zh_TW'), Tsu.Any())

export const globalLoaderConfigSchema = Tsu.Object({
  lang: localeTypeSchema.default(DEFAULT_CORE_CONFIG.global.lang),
  commandPrefix: Tsu.String().default(DEFAULT_CORE_CONFIG.global.commandPrefix),
  dirs: Tsu.Array(Tsu.String()).default(DEFAULT_LOADER_CONFIG.dirs),
  level: Tsu.Number().default(DEFAULT_LOADER_CONFIG.level),
  port: Tsu.Number().default(DEFAULT_LOADER_CONFIG.port),
  dbPrefix: Tsu.String().default(DEFAULT_LOADER_CONFIG.dbPrefix),
  noColor: Tsu.Boolean().default(DEFAULT_LOADER_CONFIG.noColor)
}).default(Object.assign(DEFAULT_CORE_CONFIG.global, DEFAULT_LOADER_CONFIG))

export const adapterConfigSchemaFactory = (lang: Tsu.infer<typeof localeTypeSchema>, commandPrefix: string) =>
  Tsu.Object({
    extends: Tsu.String().describe("Bot's adapter extends from which adapter"),
    master: Tsu.Union(Tsu.Number(), Tsu.String()).describe("Bot's master id"),
    lang: localeTypeSchema.default(lang).describe("Bot's language"),
    commandPrefix: Tsu.String().default(commandPrefix).describe("Bot's command prefix")
  })

export const modulePackageSchema = Tsu.Object({
  name: Tsu.Custom<string>((input) => {
    if (typeof input !== 'string') return false
    /*  package name must prefix with 'kotori-plugin-' if don't have scope */
    return input.startsWith('@') || input.startsWith(PLUGIN_PREFIX)
  }),
  version: Tsu.String(),
  description: Tsu.String(),
  main: Tsu.String(),
  license: Tsu.Union(Tsu.Literal('GPL-3.0'), Tsu.Literal('BCU')),
  keywords: Tsu.Custom<string[]>(
    (val) => Array.isArray(val) && val.includes('kotori') && val.includes('chatbot') && val.includes('kotori-plugin')
  ),
  author: Tsu.Union(Tsu.String(), Tsu.Array(Tsu.String())),
  // peerDependencies: Tsu.Object({
  //   'kotori-bot': Tsu.String()
  // }),
  kotori: Tsu.Object({
    enforce: Tsu.Union(Tsu.Literal('pre'), Tsu.Literal('post')).optional(),
    meta: Tsu.Object({
      language: Tsu.Array(localeTypeSchema).default([])
    }).default({ language: [] })
  }).default({
    enforce: undefined,
    meta: { language: [] }
  })
})

export class Loader extends Core {
  private loadRecord = new Set<string>()

  private isDev: boolean

  private format(template: string, args: (string | number)[]) {
    return formatFactory(this.i18n)(template, args)
  }

  public readonly baseDir: BaseDir

  public readonly options: Options

  public readonly [Symbols.modules]: Map<string, [ModuleMeta, ModuleConfig, Parser<unknown>?]> = new Map()

  public constructor(loaderOptions?: LoaderOptions) {
    const baseDir = getBaseDir(loaderOptions?.config || CONFIG_NAME, loaderOptions?.dir)
    const options = { mode: loaderOptions?.mode || BUILD_MODE, isDaemon: !!loaderOptions?.isDaemon }
    super(getConfig(baseDir, options))
    this.baseDir = baseDir
    this.options = options
    this.isDev = options.mode === DEV_MODE
    this.root.meta.loaderVersion = require('../../package.json').version
    this.provide(
      'logger',
      new KotoriLogger(
        {
          level: this.config.global.level,
          label: [],
          transports: [
            new ConsoleTransport({
              template: '<blue>%time%</blue> %level% (<bold>%pid%</bold>) %labels%: %msg%',
              time: 'M/D H:m:s',
              useColor: !this.config.global.noColor
            }),
            new FileTransport({ dir: this.baseDir.logs, filter: (data) => data.level >= LoggerLevel.WARN })
          ]
        },
        this
      )
    )
    this.inject('logger')
    this.service('server', new Server(this.extends('server'), { port: this.config.global.port }))
    this.service('file', new File(this.extends('file')))
    this.service('db', new Database(this.extends('database'), { prefix: this.config.global.dbPrefix }))
    this.http.response(undefined, (err) => {
      if ('logger' in this) this.logger.label('http').error(err instanceof Error ? err.message : err)
      // return Promise.reject(err)
    })
    this.i18n.use(path.resolve(__dirname, '../../locales'))
  }

  public run(onlyStart = false) {
    if (onlyStart) return this.start()
    this.logger.trace('baseDir:', this.baseDir)
    this.logger.trace('options:', this.options)
    this.logger.trace('config:', this.config)
    this.logger.trace('where:', __dirname, __filename)
    this.logger.trace('running:', process.cwd())

    loadInfo(this.meta, this)
    this.catchError()
    this.listenMessage()
    this.loadAllModules()
    this.checkUpdate()
  }

  private catchError() {
    const handleError = (err: Error | unknown, prefix: string) => {
      if (!(err instanceof KotoriError)) {
        if (err instanceof Error) return this.logger.label(prefix).error(err.message, err.stack)
        return this.logger.label(prefix).error(err)
      }
      if (err.label === 'dev') return this.logger.label('dev').debug(err.message, err.stack)
      if (err.label) return this.logger.label(err.label).error(err.message, err.stack)
      return this.logger.error(err.message, err.stack)
    }

    // process.on('uncaughtExceptionMonitor', (err) => handleError(err, 'sync'))
    process.on('unhandledRejection', (err) => handleError(err, 'async'))
    process.on('uncaughtException', (err) => handleError(err, 'sync'))
    // process.on('SIGINT', () => process.exit())
    this.on('error', (err) => {
      handleError(err, 'async')
    })
    if (this.options.mode === DEV_MODE) this.logger.debug(this.i18n.t`loader.debug.info`)
  }

  private listenMessage() {
    this.on('connect', (data) => {
      const { type, mode, normal, address: addr, adapter } = data
      let msg: string
      if (type === 'connect') {
        switch (mode) {
          case 'ws':
            msg = this.format(`loader.bots.${normal ? 'connect' : 'reconnect'}`, [addr])
            break
          case 'ws-reverse':
            msg = this.format(`loader.bots.${normal ? 'start' : 'restart'}`, [addr])
            break
          default:
            msg = this.format('loader.bots.ready', [addr])
        }
      } else {
        switch (mode) {
          case 'ws':
            msg = this.format(`loader.bots.disconnect${normal ? '' : '.error'}`, [addr])
            break
          case 'ws-reverse':
            msg = this.format(`loader.bots.stop${normal ? '' : '.error'}`, [addr])
            break
          default:
            msg = this.format('loader.bots.dispose', [addr])
        }
      }
      adapter.ctx.logger[normal ? 'info' : 'warn'](msg)
    })
    this.on('status', ({ status, adapter }) => adapter.ctx.logger.info(status))
    this.on('ready_module', (data) => {
      if (typeof data.instance !== 'object') return

      const pkg = data.instance.name ? this[Symbols.modules].get(data.instance.name) : undefined
      if (!pkg) return

      const { name, version, author } = pkg[0].pkg
      if (this.loadRecord.has(name)) return
      this.loadRecord.add(name)
      this.logger.info(
        this.format(
          data.instance.default && 'isRescript' in data.instance.default
            ? 'loader.modules.loadRes'
            : 'loader.modules.load',
          [name, version, Array.isArray(author) ? author.join(',') : author]
        )
      )
    })
  }

  private async checkModuleFiles(rootDir: string, filename: string) {
    const dir = path.join(rootDir, filename)
    if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return

    // Only try to check the modules which folder name prefixed with "kotori-plugin-" at node_modules directory
    const dirArr = path.parse(dir).dir.split('/')
    if (dirArr[dirArr.length - 1].endsWith('node_modules') && !filename.startsWith(PLUGIN_PREFIX)) return

    const pkgPath = path.join(dir, 'package.json')
    let pkg: ModulePackage
    if (!fs.existsSync(pkgPath)) return

    try {
      pkg = modulePackageSchema.parse(JSON.parse(fs.readFileSync(pkgPath).toString()))
      if (INTERNAL_PACKAGES.includes(pkg.name)) return
    } catch (e) {
      if (e instanceof TsuError) throw new DevError(`package.json format error ${pkgPath}: ${e.message}`)
      throw new DevError(`illegal package.json ${pkgPath}`)
    }

    const loadTsFile = this.isDev
      ? ['src/index.ts', 'src/index.tsx'].find((el) => fs.existsSync(path.join(dir, el)))
      : undefined
    const main = path.resolve(dir, loadTsFile ?? pkg.main)
    if (!fs.existsSync(main)) throw new DevError(`cannot find main file ${main}`)

    const getDirFiles = (rootDir: string) => {
      const files = fs.readdirSync(rootDir)
      const list: string[] = []

      for (const fileName of files) {
        const file = path.join(rootDir, fileName)
        if (fs.statSync(file).isDirectory()) {
          list.push(...getDirFiles(file))
        }
        // Might be `.tsx`
        if (path.parse(file).ext.startsWith('.ts') && !this.isDev) continue
        list.push(path.resolve(file))
      }

      return list
    }

    const files = getDirFiles(path.join(dir, loadTsFile ? 'src' : path.parse(pkg.main).dir))

    const [pkgScope, pkgName] = pkg.name.split('/')
    const pluginName = `${pkgScope.startsWith('@') && pkgScope !== '@kotori-bot' ? `${pkgScope.slice(1)}/` : ''}${(pkgName ?? pkgScope).replace(PLUGIN_PREFIX, '')}`
    this[Symbols.modules].set(pkg.name, [{ pkg, files, main }, this.config.plugin[pluginName] ?? {}])
  }

  private loadEx(instance: ModuleMeta, origin: ModuleConfig) {
    this.logger.trace('module:', instance, origin)

    // Adapted @kotori-bot/kotori-plugin-filter
    if (!instance.main) return

    const { main, pkg } = instance
    // biome-ignore lint:
    let obj: Record<string, any>
    try {
      obj = require(main)
    } catch (e) {
      this.emit('error', KotoriError.from(e, 'module'))
      return
    }
    let config = origin
    const adapterName = pkg.name.split(ADAPTER_PREFIX)[1]

    // Exclude plugins was registered by decorators
    if (Decorators.getMeta(pkg.name)) {
      this.emit('literal_ready_module_decorator', pkg.name, config)
      return
    }

    const parsed = (schema: Parser<unknown>) => {
      this[Symbols.modules].set(pkg.name, [instance, origin, schema])
      const result = (schema as Parser<ModuleConfig>).parseSafe(config)
      if (!result.value) throw new ModuleError(`config format of module ${pkg.name} is error: ${result.error.message}`)
      return result.data
    }

    if (obj.config instanceof Parser) {
      /* Adapter Class */
      // Adapter don't directly parse reality config, save config parser
      if (obj.default && Adapter.isPrototypeOf.call(Adapter, obj.default) && adapterName) {
        this[Symbols.adapter].set(adapterName, [obj.default, obj.config])
        obj = {}
      } else {
        config = parsed(obj.config)
      }
    }

    /* Load lang files and parse reality config */
    const loadLang = (lang: string | string[]) => this.i18n.use(path.resolve(...(Array.isArray(lang) ? lang : [lang])))
    if (obj.lang) loadLang(obj.lang)
    if (obj.default?.lang) loadLang(obj.default.lang)
    if (obj.Main?.lang) loadLang(obj.Main.lang)
    if (obj.default?.config instanceof Parser) config = parsed(obj.default.config)
    if (obj.Main?.config instanceof Parser) config = parsed(obj.Main.config)

    /* Service Class */
    // Service need parse reality config and load lang files
    if (Service.isPrototypeOf.call(Service, obj.default)) {
      const serviceName = (pkg.name.split('/')[1] ?? pkg.name).replace(PLUGIN_PREFIX, '')
      this.service(serviceName, new obj.default(this.extends(serviceName), config))
      // but it is different with normal plugin: need not load immediately so reset obj
      obj = {}
    }

    /* Rescript Plugins */
    if (typeof obj.main === 'function' && pkg.keywords?.includes('rescript')) {
      // obj.default will be called before obj.main
      obj.default = (ctx: this, config: object) => {
        // ctx.mixin('resHooker', resHookerProps, true)
        obj.main(ctx, config)
      }
      obj.default.isRescript = true
    }

    try {
      this.load({ name: pkg.name, ...obj, config })
    } catch (e) {
      this.emit('error', KotoriError.from(e, 'module'))
    }
  }

  private unloadEx({ files, pkg }: ModuleMeta) {
    for (const file of files) delete require.cache[require.resolve(file)]
    this.unload({ name: pkg.name })
  }

  private loadAllModules() {
    for (const item of this.config.global.dirs) {
      const dir = path.resolve(this.baseDir.root, item)
      if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) continue
      this.logger.trace('load dirs:', dir)
      for (const filename of fs.readdirSync(dir)) this.checkModuleFiles(dir, filename)
    }

    const handleModules = Array.from(this[Symbols.modules].values()).sort(
      (m1, m2) => moduleLoaderOrder(m1[0].pkg) - moduleLoaderOrder(m2[0].pkg)
    )
    for (const el of handleModules) this.loadEx(el[0], el[1])

    if (this.isDev) {
      for (const data of this[Symbols.modules].values()) {
        for (const file of data[0].files) {
          fs.watchFile(file, () => {
            this.logger.debug(this.format('loader.debug.reload', [data[0].pkg.name]))
            this.unloadEx(data[0])
            this.loadEx(data[0], data[1])
          })
        }
      }
    }

    const failLoadCount = this[Symbols.modules].size - this.loadRecord.size
    this.logger.info(
      this.format(`loader.modules.all${failLoadCount > 0 ? '.failed' : ''}`, [this.loadRecord.size, failLoadCount])
    )
    this.loadAllAdapter()
    this.start()
  }

  private loadAllAdapter() {
    const adapters = this[Symbols.adapter]
    for (const identity of Object.keys(this.config.adapter)) {
      const botConfig = this.config.adapter[identity]
      const array = adapters.get(botConfig.extends)

      if (!array) {
        this.logger.warn(this.format('loader.adapters.notfound', [botConfig.extends, identity]))
        continue
      }

      const result = array[1]?.parseSafe(botConfig)
      if (result && !result.value) {
        this.emit('error', new ModuleError(this.format('error.module.config_bot', [identity, result.error.message])))
        continue
      }

      try {
        const bot = new array[0](
          this.extends(`${botConfig.extends}/${identity}`),
          result ? (result.data as AdapterConfig) : botConfig,
          identity
        )

        const bots = this[Symbols.bot].get(bot.platform)
        if (bots) bots.add(bot.api)
        else this[Symbols.bot].set(bot.platform, new Set([bot.api]))
        this.on('ready', () => bot.start())
        this.on('dispose', () => bot.stop())
      } catch (e) {
        this.emit('error', KotoriError.from(e, 'adapter'))
      }
    }
  }

  private async checkUpdate() {
    const { version } = this.meta
    if (!version) return
    const res = await new Http().get(GLOBAL.UPDATE).catch(() => {})
    if (!res || !Tsu.Object({ version: Tsu.String() }).check(res)) {
      this.logger.warn(this.i18n.t`loader.tips.update.failed`)
    } else if (version === res.version) {
      this.logger.info(this.i18n.t`loader.tips.update.latest`)
    } else {
      this.logger.warn(this.format('loader.tips.update.available', [version, res.version, GLOBAL.REPO]))
    }
  }
}

export default Loader
