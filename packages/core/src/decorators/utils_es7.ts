import 'reflect-metadata'
import { Tokens, type Context, type EventsList, type ModuleConfig, Service } from 'fluoro'
import Tsu, { type Constructor, Parser } from 'tsukiko'
import { DevError, ModuleError } from '../utils/error'
import { Symbols } from '../global'
import { resolve } from 'node:path'
import type { CommandConfig } from '../types'
import { KotoriPlugin } from './plugin'

interface EventOption {
  type: keyof EventsList
  isOnce?: boolean
}

interface CommandOption extends Omit<CommandConfig, 'action'> {
  template: string
  options?: [string, string][]
}

interface MidwareOption {
  priority?: number
}

interface RegexpOption {
  match: RegExp
}

type TaskOption = Exclude<Parameters<Context['task']>[0], string>

// biome-ignore lint:
type Fn = (...args: any[]) => any

interface PluginMetaAll {
  name: string
  lang?: string
  inject: string[]
  schema?: Parser<object>
  events: [Fn, EventOption, boolean][]
  midwares: [Fn, MidwareOption, boolean][]
  commands: [Fn, CommandOption, boolean][]
  regexps: [Fn, RegexpOption, boolean][]
  tasks: [Fn, TaskOption, boolean][]
}

type KotoriPluginChild = new (...args: ConstructorParameters<typeof KotoriPlugin>) => KotoriPlugin
type KotoriPluginConstructor = KotoriPluginChild & Record<string | symbol, unknown>

export class Decorators {
  public static [Symbols.decorator] = new Map<string, KotoriPluginChild>()

  public static getMeta(target: object | string): PluginMetaAll | undefined {
    return Reflect.getMetadata(
      Symbols.modules,
      typeof target === 'string' ? Decorators[Symbols.decorator].get('string') ?? {} : target
    )
  }

  public static setup(ctx: Context) {
    ctx.on('literal_ready_module_decorator', (name, config) => Decorators.load(ctx, name, config))
  }

  public static load(ctx: Context, target: string | Constructor, config: ModuleConfig) {
    const Constructor = typeof target === 'string' ? Decorators[Symbols.decorator].get(target) : target
    if (!Constructor) return false
    const meta = Decorators.getMeta(Constructor)
    if (!meta) return false

    const { name } = meta
    if (meta.lang) ctx.i18n.use(meta.lang)
    let configHandle = config
    if (meta.schema) {
      const result = meta.schema.parseSafe(config)
      if (!result.value) throw new ModuleError(`config format of module ${name} is error: ${result.error.message}`)
      configHandle = result.data
    }

    const childCtx = ctx.extends({}, name)
    // Injected service
    for (const identity of meta.inject) {
      // Get reality name of service
      const serviceData = Array.from(ctx[Tokens.container]).find(
        (service) => service instanceof Service && service.identity === identity
      )
      if (serviceData) childCtx.inject(serviceData[1] as unknown as 'cache')
    }

    const plugin = new Constructor(ctx, configHandle)
    // Bind `this` of methods and register them
    const bound = <T extends Fn>(fn: T, isStatic: boolean) => fn.bind(isStatic ? Constructor : plugin)
    for (const [fn, options, isStatic] of meta.events) {
      childCtx[options.isOnce ? 'once' : 'on'](options.type, bound(fn, isStatic))
    }
    for (const [fn, options, isStatic] of meta.midwares) {
      childCtx.midware(bound(fn, isStatic), options.priority)
    }
    for (const [fn, options, isStatic] of meta.commands) {
      childCtx.command(options.template, { ...options, action: bound(fn, isStatic) })
    }
    for (const [fn, options, isStatic] of meta.regexps) {
      childCtx.regexp(options.match, bound(fn, isStatic))
    }
    for (const [fn, options, isStatic] of meta.tasks) {
      childCtx.task(options, bound(fn, isStatic))
    }

    const params = { instance: { inject: meta.inject, name: name, config: configHandle, default: Constructor } }
    ctx.emit('ready_module', params)
    return true
  }

  private readonly pkgName: string

  private Constructor: KotoriPluginConstructor

  private error(message = 'plugin not decorated') {
    return new DevError(`${message} at module ${this.pkgName}`)
  }

  private getMeta() {
    return this.Constructor ? Decorators.getMeta(this.Constructor) : undefined
  }

  public constructor(pkgName: string) {
    this.pkgName = pkgName
    this.Constructor = KotoriPlugin as KotoriPluginConstructor
  }

  // biome-ignore lint:
  public readonly import = (value: new (...args: any[]) => any, _: ClassDecoratorContext) => {
    if (Decorators[Symbols.decorator].has(this.pkgName) || Decorators.getMeta(value))
      throw this.error('plugin already decorated')
    this.Constructor = value as unknown as KotoriPluginConstructor
    Reflect.defineMetadata(Symbols.modules, value, { name: this.pkgName })
    Decorators[Symbols.decorator].set(this.pkgName, value as KotoriPluginChild)
  }

  public readonly lang = (_: undefined, { name }: ClassFieldDecoratorContext) => {
    const meta = this.getMeta()
    if (!meta) throw this.error()
    const result = Tsu.Union(Tsu.String(), Tsu.Array(Tsu.String())).parseSafe(this.Constructor[name])
    if (!result.value) throw this.error('lang must be string or string[]')
    meta.lang = resolve(...(typeof result.data === 'string' ? [result.data] : result.data))
  }

  public inject(_: undefined, { name }: ClassFieldDecoratorContext) {
    const meta = this.getMeta()
    if (!meta) throw this.error()
    const result = Tsu.Array(Tsu.String()).parseSafe(this.Constructor[name])
    if (!result.value) throw this.error(`lang must be string[] at ${this.pkgName}`)
    meta.inject = result.data
  }

  public schema(_: undefined, { name }: ClassFieldDecoratorContext) {
    const meta = this.getMeta()
    if (!meta) throw this.error()
    const value = this.Constructor[name]
    if (!(value instanceof Parser)) throw this.error('schema must be Parser')
    meta.schema = value
  }

  public on(options: EventOption) {
    return (fn: Fn, { static: isStatic }: ClassMethodDecoratorContext) => {
      const meta = this.getMeta()
      if (!meta) throw this.error()
      if (typeof fn !== 'function') throw this.error('event callback must be function')
      meta.events = [...(meta.events ?? []), [fn, options, isStatic]]
    }
  }

  public midware(options: MidwareOption = {}) {
    return (fn: Fn, { static: isStatic }: ClassMethodDecoratorContext) => {
      const meta = this.getMeta()
      if (!meta) throw this.error()
      if (typeof fn !== 'function') throw this.error('middlewares callback must be function')
      meta.midwares = [...(meta.midwares ?? []), [fn, options, isStatic]]
    }
  }

  public command(options: CommandOption) {
    return (fn: Fn, { static: isStatic }: ClassMethodDecoratorContext) => {
      const meta = this.getMeta()
      if (!meta) throw this.error()
      if (typeof fn !== 'function') throw this.error('command callback must be function')
      meta.commands = [...(meta.commands ?? []), [fn, options, isStatic]]
    }
  }

  public regexp(options: RegexpOption) {
    return (fn: Fn, { static: isStatic }: ClassMethodDecoratorContext) => {
      const meta = this.getMeta()
      if (!meta) throw this.error()
      if (typeof fn !== 'function') throw this.error('regexp callback must be function')
      meta.regexps = [...(meta.regexps ?? []), [fn, options, isStatic]]
    }
  }

  public task(options: TaskOption) {
    return (fn: Fn, { static: isStatic }: ClassMethodDecoratorContext) => {
      const meta = this.getMeta()
      if (!meta) throw this.error()
      if (typeof fn !== 'function') throw this.error('task callback must be function')
      meta.tasks = [...(meta.tasks ?? []), [fn, options, isStatic]]
    }
  }
}

export default Decorators
