import fs from 'node:fs'
import path from 'node:path'
import {
  ADAPTER_PREFIX,
  Adapter,
  type Context,
  DATABASE_PREFIX,
  DevError,
  type LocaleType,
  type ModuleConfig,
  ModuleError,
  PLUGIN_PREFIX,
  Parser,
  Service,
  Symbols,
  Tsu,
  TsuError
} from '@kotori-bot/core'
import { ConsoleTransport, FileTransport, LoggerLevel } from '@kotori-bot/logger'
import { type BUILD_MODE, CORE_MODULES, DEV_MODE } from '../constants'
import '../types/internal'
import KotoriLogger from '../utils/logger'
import './loader'

interface BaseDir {
  root: string
  data: string
  logs: string
  config: string
}

interface Options {
  mode: typeof BUILD_MODE | typeof DEV_MODE
}

interface RunnerConfig {
  baseDir: BaseDir
  options: Options
}

interface ModulePackage {
  name: string
  version: string
  description: string
  main: string
  keywords: string[]
  license: 'GPL-3.0'
  author: string | string[]
  peerDependencies: {
    'kotori-bot': string
    [propName: string]: string
  }
  kotori: {
    enforce?: 'pre' | 'post'
    meta: {
      language: LocaleType[]
    }
  }
}

interface ModuleMeta {
  pkg: ModulePackage
  files: string[]
  main: string
}

export const localeTypeSchema = Tsu.Union(Tsu.Literal('en_US'), Tsu.Literal('ja_JP'), Tsu.Literal('zh_TW'), Tsu.Any())

const modulePackageSchema = Tsu.Object({
  name: Tsu.Custom<string>((input) => {
    if (typeof input !== 'string') return false
    /*  package name must prefix with 'kotori-plugin-' if don't have scope */
    if (!input.startsWith('@') && /kotori-plugin-[a-z]([a-z,0-9]{2,13})\b/.exec(input) === null) return false
    return true
  }),
  version: Tsu.String(),
  description: Tsu.String(),
  main: Tsu.String(),
  license: Tsu.Literal('GPL-3.0'),
  keywords: Tsu.Custom<string[]>(
    (val) => Array.isArray(val) && val.includes('kotori') && val.includes('chatbot') && val.includes('kotori-plugin')
  ),
  author: Tsu.Union(Tsu.String(), Tsu.Array(Tsu.String())),
  peerDependencies: Tsu.Object({
    'kotori-bot': Tsu.String()
  }),
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

function moduleLoaderOrder(pkg: ModulePackage) {
  if (CORE_MODULES.includes(pkg.name)) return 1
  if (pkg.name.includes(DATABASE_PREFIX)) return 2
  if (pkg.name.includes(ADAPTER_PREFIX)) return 3
  if (pkg.kotori.enforce === 'pre') return 4
  if (!pkg.kotori.enforce) return 5
  return 6
}

export class Runner {
  public readonly baseDir: BaseDir

  public readonly options: Options

  private readonly ctx: Context

  private readonly isDev: boolean

  public readonly [Symbols.modules]: Map<string, [ModuleMeta, ModuleConfig]> = new Map()

  public constructor(ctx: Context, config: RunnerConfig) {
    this.ctx = ctx
    /* handle config */
    this.baseDir = config.baseDir
    this.options = config.options
    this.isDev = this.options.mode === DEV_MODE

    const loggerOptions = {
      level: this.ctx.config.global.level,
      label: [],
      transports: [
        new ConsoleTransport({
          template: '<blue>%time%</blue> %level% (<bold>%pid%</bold>) %labels%: %msg%',
          time: 'M/D H:m:s',
          useColor: !this.ctx.config.global.noColor
        }),
        new FileTransport({ dir: this.baseDir.logs, filter: (data) => data.level >= LoggerLevel.WARN })
      ]
    }

    ctx.provide('logger', new KotoriLogger(loggerOptions, this.ctx))
    ctx.inject('logger')
  }

  private getDirFiles(rootDir: string) {
    const files = fs.readdirSync(rootDir)
    const list: string[] = []

    for (const fileName of files) {
      const file = path.join(rootDir, fileName)
      if (fs.statSync(file).isDirectory()) {
        list.push(...this.getDirFiles(file))
      }
      if (path.parse(file).ext === '.ts' && !this.isDev) continue
      list.push(path.resolve(file))
    }

    return list
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
    } catch (e) {
      if (e instanceof TsuError) throw new DevError(this.ctx.format('error.dev.package.missing', [pkgPath, e.message]))
      throw new DevError(this.ctx.format('error.dev.package.illegal', [pkgPath]))
    }

    const main = path.resolve(dir, this.isDev ? 'src/index.ts' : pkg.main)
    if (!fs.existsSync(main)) throw new DevError(this.ctx.format('error.dev.main_file', [main]))
    const files = this.getDirFiles(path.join(dir, this.isDev ? 'src' : path.parse(pkg.main).dir))

    const [pkgScope, pkgName] = pkg.name.split('/')
    const pluginName = `${pkgScope.startsWith('@') && pkgScope !== '@kotori-bot' ? `${pkgScope.slice(1)}/` : ''}${(pkgName ?? pkgScope).slice((pkgName ?? pkgScope).includes(PLUGIN_PREFIX) ? PLUGIN_PREFIX.length : 0)}`
    this[Symbols.modules].set(pkg.name, [{ pkg, files, main }, this.ctx.config.plugin[pluginName] || {}])
  }

  private getModuleList() {
    const handleDirs = this.ctx.config.global.dirs
      .map((item) => path.resolve(this.ctx.baseDir.root, item))
      .filter((dir) => fs.existsSync(dir) && fs.statSync(dir).isDirectory())

    for (const item of handleDirs) {
      const dir = path.resolve(this.ctx.baseDir.root, item)
      if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) continue
      this.ctx.logger.trace('load dirs:', dir)
      for (const filename of fs.readdirSync(dir)) this.checkModuleFiles(dir, filename)
    }
  }

  private loadLang(lang?: string | string[]) {
    if (lang) this.ctx.i18n.use(path.resolve(...(Array.isArray(lang) ? lang : [lang])))
  }

  private loadEx(instance: ModuleMeta, origin: ModuleConfig) {
    this.ctx.logger.trace('module:', instance, origin)

    // adapted @kotori-bot/kotori-plugin-filter
    if (!instance.main) return

    const parsed = (schema: Parser<unknown>) => {
      const result = (schema as Parser<ModuleConfig>).parseSafe(config)
      if (!result.value) throw new ModuleError(this.ctx.format('error.module.config', [pkg.name, result.error.message]))
      return result.data
    }

    const { main, pkg } = instance
    let obj = require(main)
    let config = origin
    const adapterName = pkg.name.split(ADAPTER_PREFIX)[1]

    // Exclude plugins was registered by decorators
    if (this.ctx.get<{ registers: string[] } | undefined>('decorators')?.registers.includes(pkg.name)) {
      this.ctx.emit('ready_module_decorators', pkg.name)
      return
    }

    if (obj.config instanceof Parser) {
      /* Adapter Class */
      // Adapter don't directly parse reality config, save config parser
      if (obj.default && Adapter.isPrototypeOf.call(Adapter, obj.default) && adapterName) {
        this.ctx[Symbols.adapter].set(adapterName, [obj.default, obj.config])
        obj = {}
      } else {
        config = parsed(obj.config)
      }
    }

    /* Load lang files and parse reality config */
    if (obj.lang) this.loadLang(obj.lang)
    if (obj.default?.lang) this.loadLang(obj.default.lang)
    if (obj.Main?.lang) this.loadLang(obj.Main.lang)
    if (obj.default?.config instanceof Parser) config = parsed(obj.default.config)
    if (obj.Main?.config instanceof Parser) config = parsed(obj.Main.config)

    /* Service Class */
    // Service need parse reality config and load lang files
    if (Service.isPrototypeOf.call(Service, obj.default)) {
      this.ctx.service('', new obj.default(this.ctx.extends(), config))
      // but it is different with normal plugin: need not load immediately so reset obj
      obj = {}
    }

    this.ctx.load({ name: pkg.name, ...obj, config })
  }

  private unloadEx({ files, pkg }: ModuleMeta) {
    for (const file of files) delete require.cache[require.resolve(file)]
    this.ctx.load({ name: pkg.name })
  }

  public loadAll() {
    this.getModuleList()
    const handleModules = Array.from(this[Symbols.modules].values()).sort(
      (m1, m2) => moduleLoaderOrder(m1[0].pkg) - moduleLoaderOrder(m2[0].pkg)
    )
    for (const el of handleModules) this.loadEx(...el)
    if (this.isDev) this.watcher()
  }

  public watcher() {
    for (const data of this[Symbols.modules].values()) {
      for (const file of data[0].files) {
        fs.watchFile(file, () => {
          this.ctx.logger.debug(this.ctx.format('loader.debug.reload', [data[0].pkg.name]))
          this.unloadEx(data[0])
          this.loadEx(...data)
        })
      }
    }
  }
}

export default Runner
