import { Colors, type ColorsAdapterImpl, stringTemp, TerminalAdapter } from '@kotori-bot/tools'
import dayjs from 'dayjs'
import stringify from 'fast-safe-stringify'
import { type LoggerData, LoggerLevel, type TransportOptionsBase } from '../types/common'
import { escaperSingle } from '../utils/escaper'
import Transport from '../utils/transport'

type Level = Exclude<keyof typeof LoggerLevel, 'SILENT'>
type Color = keyof ColorsAdapterImpl

type ConsoleTransportConfig = {
  template?: string | ConsoleTransport['render']
  label?: string
  time?: string
  useColor?: boolean
  levels?: {
    [K in Level]?: [string, Color?]
  }
  indent?: number
}

const DEFAULT_OPTIONS = {
  template: '<blue>%time%</blue> %level% (<bold>%pid%</bold>) %labels%: %msg%',
  label: '[<cyan>%name%</cyan>]',
  time: 'YY/M/D H:m:s', // Reference: https://day.js.org/docs/en/display/format
  useColor: true,
  levels: {
    FATAL: ['<redBright><bold>FATAL</bold></redBright> ', 'redBright'],
    ERROR: ['<red>ERROR</red>', 'red'],
    WARN: ['<yellow>WARN</yellow>', 'yellowBright'],
    INFO: ['<green>INFO</green>'],
    RECORD: ['<cyan>LOG</cyan>'],
    DEBUG: ['<magenta>DEBUG</magenta>', 'magentaBright'],
    TRACE: ['<gray>TRACE</gray>', 'gray']
  },
  indent: 2
} as const

export class ConsoleTransport extends Transport<ConsoleTransportConfig> {
  private cs: Colors

  private readonly print = typeof process === 'undefined' ? console.log : process.stdout.write.bind(process.stdout)

  private readonly printErr = typeof process === 'undefined' ? console.error : process.stderr.write.bind(process.stderr)

  public render({ label, level, msg, time, pid }: LoggerData) {
    const { options } = this
    const levels = (options.levels ?? DEFAULT_OPTIONS.levels)[LoggerLevel[level] as Level]
    return stringTemp((options.template ?? DEFAULT_OPTIONS.template) as string, {
      time: dayjs(time).format(options.time ?? DEFAULT_OPTIONS.time),
      pid: String(pid),
      level: levels?.[0] ?? DEFAULT_OPTIONS.levels[LoggerLevel[level] as Level][0],
      labels: label.map((name) => stringTemp(options.label ?? DEFAULT_OPTIONS.label, { name })).join(' '),
      msg: levels?.[1] ? `<${levels[1]}>${msg}</${levels[1]}>` : msg
    })
  }

  public constructor(options?: ConsoleTransportConfig & TransportOptionsBase) {
    super(Object.assign(DEFAULT_OPTIONS, options ?? {}))
    this.cs = new Colors(new TerminalAdapter())
  }

  public escaper = (args: unknown[]) => {
    const result = args
      .map((arg) => {
        if (arg && typeof arg === 'object') {
          const result = stringify(arg, undefined, this.options.indent ?? DEFAULT_OPTIONS.indent)
          return result === '{}' ? String(arg) : result
        }
        return escaperSingle(arg)
      })
      .join(' ')
    return result
      .replace(/([0-9]+)/g, '<yellow>$1</yellow>')
      .replaceAll('undefined', '<dim>undefined</dim>')
      .replaceAll('null', '<bold>null</bold>')
      .replaceAll('true', '<green>true</green>')
      .replaceAll('false', '<green>false</green>')
  }

  public handle(data: LoggerData) {
    const result = typeof this.options.template === 'function' ? this.options.template(data) : this.render(data)
    if (data.level === LoggerLevel.FATAL || data.level === LoggerLevel.ERROR) {
      this.printErr(`${this.cs.parse(result)}\n`)
      return
    }
    this.print(`${this.cs.parse(result)}\n`)
  }
}

export default ConsoleTransport
