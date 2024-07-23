import 'reflect-metadata'
import { stringRightSplit } from '@kotori-bot/tools'
import type { Context, EventsList } from 'fluoro'
import type { I18n } from '@kotori-bot/i18n'
import { CronJob } from 'cron'
import type {
  CommandConfig,
  MidwareCallback,
  RegexpCallback,
  SessionData,
  MessageQuick,
  TaskCallback,
  FilterOption
} from '../types'
import { cancelFactory, disposeFactory, quickFactory, sendMessageFactory } from '../utils/factory'
import { Command } from '../utils/command'
import CommandError from '../utils/commandError'
import { Symbols } from '../global'
import Filter from '../utils/filter'

interface MidwareData {
  callback: MidwareCallback
  priority: number
}

interface RegexpData {
  match: RegExp
  callback: RegexpCallback
}

export class Message {
  public readonly [Symbols.midware]: Set<MidwareData> = new Set()

  public readonly [Symbols.command]: Set<Command> = new Set()

  public readonly [Symbols.regexp]: Set<RegexpData> = new Set()

  public readonly [Symbols.filter]: Map<string, Filter> = new Map()

  private handleMidware(session: SessionData) {
    const { api } = session
    let isPass = true
    let midwares: MidwareData[] = []

    api.adapter.status.receivedMsg += 1
    this[Symbols.midware].forEach((val) => midwares.push(val))
    midwares = midwares.sort((first, second) => first.priority - second.priority)

    let lastMidwareNum = -1
    while (midwares.length > 0) {
      if (lastMidwareNum === midwares.length) {
        isPass = false
        break
      }
      lastMidwareNum = midwares.length
      session.quick(midwares[0].callback(() => midwares.shift(), session))
    }

    this.ctx.emit('midwares', { isPass, session })
  }

  private async handleRegexp(data: EventsList['midwares']) {
    const { session } = data
    if (!data.isPass) return

    this[Symbols.regexp].forEach((data) => {
      const result = session.message.match(data.match)
      if (!result) return
      session.quick(data.callback(result, session))
      this.ctx.emit('regexp', { result, session, regexp: data.match, raw: session.message })
    })
  }

  private handleCommand(data: EventsList['midwares']) {
    const { session } = data
    const prefix = session.api.adapter.config['command-prefix'] ?? this.ctx.config.global['command-prefix']

    /* parse command shortutcs */
    this[Symbols.command].forEach((cmd) =>
      cmd.meta.shortcut.forEach((shortcut) => {
        if (session.message.startsWith(shortcut))
          session.message = session.message.replace(shortcut, `${prefix}${cmd.meta.root}`)
      })
    )

    if (!session.message.startsWith(prefix)) return

    const params = {
      session,
      raw: stringRightSplit(session.message, prefix)
    }
    this.ctx.emit('before_parse', params)

    const cancel = cancelFactory()
    this.ctx.emit('before_command', { cancel: cancel.get(), ...params })
    if (cancel.value) return

    let matched: undefined | Command
    this[Symbols.command].forEach(async (cmd) => {
      if (matched || !cmd.meta.action) return
      const result = Command.run(params.raw, cmd.meta)
      if (result instanceof CommandError && result.value.type === 'unknown') return

      matched = cmd
      this.ctx.emit('parse', { command: cmd, result, ...params, cancel: cancel.get() })
      if (cancel.value || result instanceof CommandError) return

      try {
        const executed = await cmd.meta.action({ args: result.args, options: result.options }, session)
        if (executed instanceof CommandError) {
          this.ctx.emit('command', { command: cmd, result: executed, ...params })
          return
        }
        if (executed !== undefined) session.quick(executed)
        this.ctx.emit('command', {
          command: cmd,
          result: executed instanceof CommandError ? result : executed,
          ...params
        })
      } catch (error) {
        this.ctx.emit('command', {
          command: matched,
          result: new CommandError({ type: 'error', error }),
          ...params
        })
      }
    })

    if (matched) return
    this.ctx.emit('parse', {
      command: new Command('' as string),
      result: new CommandError({ type: 'unknown', input: params.raw }),
      ...params,
      cancel: cancel.get()
    })
  }

  private readonly ctx: Context

  public constructor(ctx: Context) {
    this.ctx = ctx
    this.ctx.on('on_message', (session) => this.handleMidware(session))
    this.ctx.on('midwares', (data) => this.handleCommand(data))
    this.ctx.on('midwares', (data) => this.handleRegexp(data))
    this.ctx.on('before_send', (data) => {
      const { api } = data
      api.adapter.status.sentMsg += 1
    })
  }

  public midware(callback: MidwareCallback, priority: number = 100) {
    const data = { callback, priority }
    this[Symbols.midware].add(data)
    const dispose = () => this[Symbols.midware].delete(data)
    disposeFactory(this.ctx, dispose)
    return dispose
  }

  public command<T extends string>(template: T, config?: CommandConfig) {
    const command = new Command<T, {}>(template, config)
    this[Symbols.command].add(command as unknown as Command)
    // TODO: better way to dispose
    // const dispose = () => this[Symbols.command].delete(command as unknown as Command)
    // disposeFactory(this.ctx, dispose)
    Reflect.defineMetadata('identity', this.ctx.identity, command)
    return command
  }

  public regexp(match: RegExp, callback: RegexpCallback) {
    const data = { match, callback }
    this[Symbols.regexp].add(data)
    const dispose = () => this[Symbols.regexp].delete(data)
    disposeFactory(this.ctx, dispose)
    return dispose
  }

  // boardcast(type: MessageScope, message: MessageRaw) {
  //   const send =
  //     type === 'private'
  //       ? (api: Api) => api.send_on_message(message, 1)
  //       : (api: Api) => api.send_on_message(message, 1);
  //   /* this need support of database... */
  //   Object.values(this.botStack).forEach((apis) => {
  //     apis.forEach((api) => send(api));
  //   });
  // }

  public notify(message: MessageQuick) {
    const mainAdapterIdentity = Object.keys(this.ctx.config.adapter)[0]
    this.ctx[Symbols.bot].forEach((apis) =>
      apis.forEach((api) => {
        if (api.adapter.identity !== mainAdapterIdentity) return
        quickFactory(
          sendMessageFactory(api.adapter, 'on_message', { userId: api.adapter.config.master }),
          this.ctx.i18n.extends(api.adapter.config.lang) as I18n
        )(message)
      })
    )
  }

  public task(options: string | { cron: string; start?: boolean; timeZone?: string }, callback: TaskCallback) {
    const [cron, extraOptions] = typeof options === 'string' ? [options, {}] : [options.cron, options]
    return new CronJob(cron, () => callback(this.ctx), null, extraOptions.start ?? true, extraOptions.timeZone)
  }

  public filter(option: FilterOption) {
    if (this.ctx.identity) {
      const filter = new Filter(option)
      // this[Symbols.filter].set(this.ctx.identity, [...(this[Symbols.filter].get(this.ctx.identity) || []), filter])

      // const dispose = () => this[Symbols.filter].delete(filter.name)
    }
  }
}

export default Message
