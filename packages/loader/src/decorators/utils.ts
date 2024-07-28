import { resolve } from 'node:path'
import {
  Symbols,
  type Context,
  type EventsList,
  Service,
  type UserAccess,
  type MessageScope,
  type Parser,
  type ModuleConfig,
  ModuleError,
  Tokens
} from '@kotori-bot/core'
import '../types/internal'

type Fn = (...args: unknown[]) => void

export class Decorators {
  private readonly ctx: Context

  private isCreated = false

  private object?: object

  // biome-ignore lint:
  private register(callback: (...args: any[]) => void) {
    // biome-ignore lint:
    return (...args: any[]) =>
      this.ctx.root.once('ready_module_decorators', (pkgName) => {
        if (pkgName === this.ctx.identity) {
          callback(...args)
          return
        }
        this.register(callback)
      })
  }

  public constructor(ctx: Context) {
    this.ctx = ctx
    if (!this.ctx.root.get('decorators')) this.ctx.root.provide('decorators', { registers: [] })
    if (this.ctx.identity) this.ctx.root.get<{ registers: string[] }>('decorators').registers.push(this.ctx.identity)
  }

  public readonly import = (Target: object) => {
    this.register(() => {
      if (!this.isCreated) this.schema(Target, undefined as keyof object)
    })()
  }

  public readonly lang = <T extends object>(target: T, property: keyof T) => {
    this.register(() => {
      const lang = target[property] as string | string[]
      ;(this.ctx.parent as Context).i18n.use(resolve(...(Array.isArray(lang) ? lang : [lang])))
    })()
  }

  public readonly inject = <T extends object>(target: T, property: keyof T) => {
    this.register(() => {
      const inject = target[property] as string[]
      for (const identity of inject) {
        this.ctx[Tokens.container].forEach((service, name) => {
          if (!(service instanceof Service) || service.identity !== identity) return
          this.ctx.inject(name as Exclude<keyof Context, Symbols | number>)
        })
      }
    })()
  }

  public readonly schema = <T extends object>(Target: T, property: keyof T) => {
    this.register(() => {
      let config = (this.ctx[Symbols.modules].get(this.ctx.identity as string) ?? [])[1]
      if (Target[property]) {
        const result = (Target[property] as unknown as Parser<ModuleConfig>).parseSafe(config)
        if (!result.value)
          throw new ModuleError(`Config format of module ${this.ctx.identity} is error: ${result.error.message}`)
        config = result.data
      }

      if (this.isCreated) return
      this.isCreated = true
      this.object = new (Target as new (...args: unknown[]) => object)(this.ctx, config)
      this.ctx.root.emit('ready_module', { instance: { name: this.ctx.identity as string, config } })
    })()
  }

  public on<T extends keyof EventsList>(meta: { type: T }) {
    return this.register(<T extends object>(target: T, property: keyof T) =>
      this.ctx.on(meta.type, (...args: unknown[]) => (target[property] as Fn).bind(this.object)(...args))
    )
  }

  public once<T extends keyof EventsList>(meta: { type: T }) {
    return this.register(<T extends object>(target: T, property: keyof T) =>
      this.ctx.once(meta.type, (...args: unknown[]) => (target[property] as Fn).bind(this.object)(...args))
    )
  }

  public midware(meta?: { priority: number }) {
    return this.register(<T extends object>(target: T, property: keyof T) =>
      this.ctx.midware((next, session) => (target[property] as Fn).bind(this.object)(next, session), meta?.priority)
    )
  }

  public command(meta: {
    template: string
    alias?: string[]
    description?: string
    help?: string
    scope?: MessageScope | 'all'
    access?: UserAccess
    options?: [string, string][]
  }) {
    return this.register(<T extends object>(target: T, property: keyof T) => {
      const command = this.ctx
        .command(meta.template, meta)
        .action((data, session) => (target[property] as Fn).bind(this.object)(data, session))
      if (meta.options) for (const [name, template] of Array.from(meta.options ?? [])) command.option(name, template)
    })
  }

  public regexp(meta: { match: RegExp }) {
    return this.register(<T extends object>(target: T, property: keyof T) =>
      this.ctx.regexp(meta.match, (match, session) => (target[property] as Fn).bind(this.object)(match, session))
    )
  }

  public task(meta: Exclude<Parameters<Context['task']>[0], string>) {
    return this.register(<T extends object>(target: T, property: keyof T) =>
      this.ctx.task(meta, (ctx) => (target[property] as Fn).bind(this.object)(ctx))
    )
  }
}

export default Decorators
