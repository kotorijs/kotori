import type { Context } from 'fluoro'
import { CronJob } from 'cron'
import type {
  CommandConfig,
  MidwareCallback,
  RegexpCallback,
  SessionData,
  MessageQuick,
  TaskCallback,
  FilterOption,
  TaskOptions,
  MessageScope,
  MessageRaw
} from '../types'
import { cancelFactory } from '../utils/factory'
import { Command } from '../utils/command'
import CommandError from '../utils/commandError'
import { Symbols } from '../global'
import Filter from '../utils/filter'
import { setCommandMeta, setMidwareMeta, setRegExpMeta, setTaskMeta } from '../utils/meta'
import { randomUUID } from 'node:crypto'

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

  public readonly [Symbols.task]: Set<CronJob> = new Set()

  public readonly [Symbols.filter]: Map<string, Filter> = new Map()

  public readonly [Symbols.promise]: Set<string> = new Set()

  private handleMidware(session: SessionData) {
    const { api } = session
    api.adapter.status.receivedMsg += 1

    Array.from(this[Symbols.midware].values())
      .sort((first, last) => first.priority - last.priority)
      .map(({ callback }) => callback)
      .reverse()
      .reduce(
        (first, last) => {
          const next = () => {
            first(() => {}, session)
          }
          return () => {
            last(next, session)
          }
        },
        (_: unknown, session: SessionData) => {
          this.handleCommand(session)
          this.handleRegexp(session)
        }
      )(() => {}, session)
  }

  private async handleRegexp(session: SessionData) {
    for (const data of this[Symbols.regexp]) {
      const result = session.message.match(data.match)
      if (!result) continue
      const cancel = cancelFactory()
      this.ctx.emit('before_regexp', { session, regexp: data.match, raw: session.message, cancel: cancel.get() })
      if (cancel.value) continue
      session.quick(data.callback(result, session))
      this.ctx.emit('regexp', { result, session, regexp: data.match, raw: session.message })
    }
  }

  private async handleCommand(session: SessionData) {
    const prefix = session.api.adapter.config['command-prefix'] ?? this.ctx.config.global['command-prefix']

    /* parse command shortcuts */
    for (const cmd of this[Symbols.command]) {
      for (const shortcut of cmd.meta.shortcut) {
        if (!session.message.startsWith(shortcut)) continue
        session.message = session.message.replace(shortcut, `${prefix}${cmd.meta.root}`)
      }
    }

    if (!session.message.startsWith(prefix)) return

    const params = {
      session,
      raw: session.message.slice(prefix.length)
    }
    this.ctx.emit('before_parse', params)

    const cancel = cancelFactory()
    this.ctx.emit('before_command', { cancel: cancel.get(), ...params })
    if (cancel.value) return

    let matched: undefined | Command
    for (const cmd of this[Symbols.command]) {
      if (matched || !cmd.meta.action) continue
      const result = Command.run(params.raw, cmd.meta)
      if (result instanceof CommandError && result.value.type === 'unknown') continue

      matched = cmd
      this.ctx.emit('parse', { command: cmd, result, ...params, cancel: cancel.get() })
      if (cancel.value || result instanceof CommandError) continue

      try {
        const executed = cmd.meta.action({ args: result.args, options: result.options }, session)
        if (executed instanceof CommandError) {
          this.ctx.emit('command', { command: cmd, result: executed, ...params })
          continue
        }
        if (executed !== undefined) session.quick(executed)
        this.ctx.emit('command', {
          command: cmd,
          result: executed instanceof CommandError ? result : executed,
          ...params
        })
      } catch (error) {
        this.ctx.emit('command', { command: matched, result: new CommandError({ type: 'error', error }), ...params })
      }
    }

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
    this.ctx.on('before_send', (data) => {
      const { api } = data
      api.adapter.status.sentMsg += 1
    })
  }

  public midware(callback: MidwareCallback, priority = 100) {
    setMidwareMeta(callback, { identity: this.ctx.identity, priority })
    const data = { callback, priority }
    this[Symbols.midware].add(data)
    return () => this[Symbols.midware].delete(data)
  }

  public command<T extends string>(template: T, config?: CommandConfig) {
    // biome-ignore lint:
    const command = new Command<T, {}>(template, config)
    this[Symbols.command].add(command as unknown as Command)
    setCommandMeta(command, { identity: this.ctx.identity, ...(command as unknown as Command).meta })
    return command
  }

  public regexp(match: RegExp, callback: RegexpCallback) {
    setRegExpMeta(callback, { identity: this.ctx.identity, match })
    const data = { match, callback }
    this[Symbols.regexp].add(data)
    return () => this[Symbols.regexp].delete(data)
  }

  public boardcast(type: MessageScope, message: MessageRaw) {
    // const send =
    //   type === 'private'
    //     ? (api: Api) => api.send_on_message(message, 1)
    //     : (api: Api) => api.send_on_message(message, 1);
    // /* this need support of database... */
    // Object.values(this.botStack).forEach((apis) => {
    //   apis.forEach((api) => send(api));
    // });
  }

  public notify(message: MessageQuick) {
    const mainAdapterIdentity = Object.keys(this.ctx.config.adapter)[0]
    for (const apis of this.ctx[Symbols.bot].values()) {
      for (const api of apis) {
        if (api.adapter.identity !== mainAdapterIdentity) continue
        // quickFactory(
        //   sendMessageFactory(api.adapter, 'on_message', { userId: api.adapter.config.master }),
        //   this.ctx.i18n.extends(api.adapter.config.lang) as I18n
        // )(message)
      }
    }
  }

  public task(options: TaskOptions, callback: TaskCallback) {
    const [baseOption, extraOptions] = typeof options === 'string' ? [options, {}] : [options.cron, options]
    const task = new CronJob(
      baseOption,
      () => callback(this.ctx),
      null,
      extraOptions.start ?? true,
      extraOptions.timeZone
    )
    setTaskMeta(task, { identity: this.ctx.identity, task, options })
    this[Symbols.task].add(task)
  }

  public filter(option: FilterOption) {
    const filterId = randomUUID().slice(0, 12).replaceAll('-', '')
    this[Symbols.filter].set(filterId, new Filter(option))
    // Although ctx.identity maybe empty but only it's not empty can be tested
    return this.ctx.extends(undefined, `${this.ctx.identity}_${filterId}`)
  }
}

export default Message
