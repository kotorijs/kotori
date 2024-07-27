/*
 * @Author: Hotaru biyuehuya@gmail.com
 * @Blog: https://hotaru.icu
 * @Date: 2024-02-07 13:44:38
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2024-07-25 11:48:12
 */
import type { LoggerFilter, LoggerOptions } from './types/internal'
import { type LoggerData, LoggerLevel } from './types/common'
import { escaper } from './utils/escaper'
import { DEFAULT_LOGGER_OPTIONS } from './const'
import type Transport from './utils/transport'
import { ConsoleTransport } from './transport'

function runTransport(transport: Transport, data: LoggerData, filter?: LoggerFilter) {
  if (filter && !filter(data)) return
  if (transport.options.filter && !transport.options.filter(data)) return
  transport.handle(data)
}

export class Logger {
  private readonly options: LoggerOptions

  private creator(level: LoggerLevel, args: unknown[]) {
    const { label, transports, filter } = this.options
    const baseData = { level, time: new Date().getTime(), pid: process.pid, label }
    if (!Array.isArray(transports)) {
      runTransport(transports, { ...baseData, msg: (transports.escaper ?? escaper)(args) }, filter)
      return
    }
    let msg: string | undefined
    for (const transport of transports) {
      if (transport.escaper) {
        runTransport(transport, { ...baseData, msg: transport.escaper(args) }, filter)
        continue
      }
      if (msg === undefined) msg = escaper(args)
      runTransport(transport, { ...baseData, msg }, filter)
    }
  }

  public constructor(options: Partial<LoggerOptions> = DEFAULT_LOGGER_OPTIONS) {
    this.options = Object.assign(DEFAULT_LOGGER_OPTIONS, options)
  }

  public extends(options: Partial<LoggerOptions> = {}) {
    const proxy = new Proxy(options, {
      get: (_, prop) => {
        if (options[prop as keyof typeof options] !== undefined) return options[prop as keyof typeof options]
        return this.options[prop as keyof typeof this.options]
      }
    })
    return new Proxy(new Logger(), {
      get: (target, prop, receiver) => {
        if (prop === 'options') return proxy
        return Reflect.get(target, prop, receiver)
      }
    })
  }

  public label(label: string | string[]) {
    return this.extends({ label: [...this.options.label, ...(typeof label === 'string' ? [label] : label)] })
  }

  public fatal(...args: unknown[]) {
    if (this.options.level > LoggerLevel.FATAL) return
    this.creator(LoggerLevel.FATAL, args)
  }

  public error(...args: unknown[]) {
    if (this.options.level > LoggerLevel.ERROR) return
    this.creator(LoggerLevel.ERROR, args)
  }

  public warn(...args: unknown[]) {
    if (this.options.level > LoggerLevel.WARN) return
    this.creator(LoggerLevel.WARN, args)
  }

  public info(...args: unknown[]) {
    if (this.options.level > LoggerLevel.INFO) return
    this.creator(LoggerLevel.INFO, args)
  }

  public record(...args: unknown[]) {
    if (this.options.level > LoggerLevel.RECORD) return
    this.creator(LoggerLevel.RECORD, args)
  }

  public debug(...args: unknown[]) {
    if (this.options.level > LoggerLevel.DEBUG) return
    this.creator(LoggerLevel.DEBUG, args)
  }

  public trace(...args: unknown[]) {
    if (this.options.level > LoggerLevel.TRACE) return
    this.creator(LoggerLevel.TRACE, args)
  }
}

export namespace Logger {
  const logger = new Logger({ level: LoggerLevel.INFO, transports: new ConsoleTransport() })
  export const fatal = logger.fatal.bind(logger)
  export const error = logger.error.bind(logger)
  export const warn = logger.warn.bind(logger)
  export const info = logger.info.bind(logger)
}

export * from './utils/escaper'
export * from './utils/transport'
export * from './types/common'
export * from './transport'
export * from './const'
export default Logger
