import 'reflect-metadata'
import { Tokens, type Context, type EventsList, type ModuleConfig, Service } from 'fluoro'
import Tsu, { type Constructor, Parser } from 'tsukiko'
import { DevError, ModuleError } from '../utils/error'
import { Symbols } from '../global'
import { resolve } from 'node:path'
import type { CommandConfig } from '../types'
import type { KotoriPlugin } from './plugin'

declare module 'fluoro' {
  interface EventsMapping {
    literal_ready_module_decorator(name: string, config: ModuleConfig): void
  }
}

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
export class Decorators {
  public static [Symbols.decorator] = new Map<string, KotoriPluginChild>()

  public static getMeta(target: object | string): PluginMetaAll | undefined {
    return Reflect.getMetadata(
      Symbols.modules,
      typeof target === 'string' ? Decorators[Symbols.decorator].get(target) ?? {} : target
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

    const childCtx = ctx.extends(name)
    // Injected service
    for (const identity of meta.inject) {
      // Get reality name of service
      const serviceData = Array.from(ctx[Tokens.container]).find(
        ([, service]) => service instanceof Service && service.identity === identity
      )
      if (serviceData) childCtx.inject(serviceData[0] as unknown as 'cache')
    }

    const plugin = new Constructor(childCtx, configHandle)
    // Bind `this` of methods and register them
    const bound = <T extends Fn>(fn: T, isStatic: boolean) => fn.bind(isStatic ? Constructor : plugin)
    for (const [fn, options, isStatic] of meta.events) {
      childCtx[options.isOnce ? 'once' : 'on'](options.type, bound(fn, isStatic))
    }
    for (const [fn, options, isStatic] of meta.midwares) {
      childCtx.midware(bound(fn, isStatic), options.priority)
    }
    for (const [fn, options, isStatic] of meta.commands) {
      const cmd = childCtx.command(options.template, { ...options, action: bound(fn, isStatic) })
      for (const option of JSON.parse(JSON.stringify(options.options ?? []))) cmd.option(option[0], option[1])
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

  private error(message = 'plugin not decorated') {
    return new DevError(`${message} at module ${this.pkgName}`)
  }

  private getMeta(target: object) {
    const value = 'prototype' in target ? target : target.constructor
    let meta = Decorators.getMeta(value)
    if (meta) return meta
    meta = { commands: [], events: [], midwares: [], inject: [], regexps: [], name: 'unknown', tasks: [] }
    Reflect.defineMetadata(Symbols.modules, meta, value)
    return meta
  }

  public constructor(pkgName: string) {
    this.pkgName = pkgName
  }

  public readonly import = (target: object) => {
    if (Decorators[Symbols.decorator].has(this.pkgName)) throw this.error('plugin already decorated')
    const meta = this.getMeta(target)
    meta.name = this.pkgName
    Decorators[Symbols.decorator].set(this.pkgName, target as KotoriPluginChild)
  }

  public readonly lang = <T extends object>(target: T, name: keyof T) => {
    // const f: MethodDecorator
    const meta = this.getMeta(target)
    const result = Tsu.Union(Tsu.String(), Tsu.Array(Tsu.String())).parseSafe(target[name])
    if (!result.value) throw this.error('lang must be string or string[]')
    meta.lang = resolve(...(typeof result.data === 'string' ? [result.data] : result.data))
  }

  public readonly inject = <T extends object>(target: T, name: keyof T) => {
    const meta = this.getMeta(target)
    const result = Tsu.Array(Tsu.String()).parseSafe(target[name])
    if (!result.value) throw this.error(`inject must be string[] at ${this.pkgName}`)
    meta.inject = result.data
  }

  public readonly schema = <T extends object>(target: T, name: keyof T) => {
    const meta = this.getMeta(target)
    const value = target[name]
    if (!(value instanceof Parser)) throw this.error('schema must be Parser')
    meta.schema = value
  }

  public on(options: EventOption) {
    return <T extends object>(target: T, key: keyof T) => {
      const meta = this.getMeta(target)
      const fn = target[key] as Fn
      if (typeof fn !== 'function') throw this.error('event callback must be function')
      meta.events = [...(meta.events ?? []), [fn, options, 'prototype' in target]]
    }
  }

  public midware(options: MidwareOption = {}) {
    return <T extends object>(target: T, key: keyof T) => {
      const meta = this.getMeta(target)
      const fn = target[key] as Fn
      if (typeof fn !== 'function') throw this.error('middlewares callback must be function')
      meta.midwares = [...(meta.midwares ?? []), [fn, options, 'prototype' in target]]
    }
  }

  public command(options: CommandOption) {
    return <T extends object>(target: T, key: keyof T) => {
      const meta = this.getMeta(target)
      const fn = target[key] as Fn
      if (typeof fn !== 'function') throw this.error('command callback must be function')
      meta.commands = [...(meta.commands ?? []), [fn, options, 'prototype' in target]]
    }
  }

  public regexp(options: RegexpOption) {
    return <T extends object>(target: T, key: keyof T) => {
      const meta = this.getMeta(target)
      const fn = target[key] as Fn
      if (typeof fn !== 'function') throw this.error('regexp callback must be function')
      meta.regexps = [...(meta.regexps ?? []), [fn, options, 'prototype' in target]]
    }
  }

  public task(options: TaskOption) {
    return <T extends object>(target: T, key: keyof T) => {
      const meta = this.getMeta(target)
      const fn = target[key] as Fn
      if (typeof fn !== 'function') throw this.error('task callback must be function')
      meta.tasks = [...(meta.tasks ?? []), [fn, options, 'prototype' in target]]
    }
  }
}

export default Decorators
