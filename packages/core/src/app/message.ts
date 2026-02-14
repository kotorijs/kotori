import { randomUUID } from 'node:crypto'
import { CronJob } from 'cron'
import type { IdentityType } from 'fluoro'
import { Command, Filter, type Session, type SessionMsg } from '../components'
import Decorators from '../decorators/utils'
import { Symbols } from '../global'
import {
  type CommandConfig,
  type FilterOption,
  MessageScope,
  type MidwareCallback,
  type RegexpCallback,
  type TaskCallback,
  type TaskOptions
} from '../types'
import { CommandError } from '../utils/error'
import {
  cancelFactory,
  getCommandMeta,
  getRegExpMeta,
  setCommandMeta,
  setMidwareMeta,
  setRegExpMeta,
  setTaskMeta
} from '../utils/internal'
import type { Context } from './core'

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

  public readonly [Symbols.promise]: Map<string, ((value: SessionMsg['message']) => void)[]> = new Map()

  private handleMidware(session: SessionMsg) {
    const { api } = session
    api.adapter.status.receivedMsg += 1
    const setup = Array.from(this[Symbols.midware].values())
      .sort((first, last) => first.priority - last.priority)
      .map(({ callback }) => callback)
      .reverse()
      .reduce(
        (first, last) => {
          const next = () => {
            first(() => { }, session)
          }
          return () => {
            last(next, session)
          }
        },
        (_: unknown, session: SessionMsg) => {
          this.handleCommand(session)
          this.handleRegexp(session)
        }
      )
    setup(() => { }, session)
  }

  private async handleRegexp(session: SessionMsg) {
    for (const data of this[Symbols.regexp]) {
      const result = session.message.match(data.match)
      if (!result) continue
      const cancel = cancelFactory()
      this.ctx.emit('before_regexp', {
        session,
        regexp: data.match,
        raw: session.message.toString(),
        cancel: cancel.get()
      })
      if (cancel.value) continue
      session.quick(data.callback(result, session))
      this.ctx.emit('regexp', { result, session, regexp: data.match, raw: session.message.toString() })
    }
  }

  private async handleCommand(session: SessionMsg) {
    const prefix = session.api.adapter.config.commandPrefix ?? this.ctx.config.global.commandPrefix

    /* parse command shortcuts */
    for (const cmd of this[Symbols.command]) {
      for (const shortcut of cmd.meta.shortcut) {
        if (session.message.split(' ')[0] !== shortcut) continue
        session.message = session.message.replace(shortcut, `${prefix}${cmd.meta.root}`)
      }
    }

    if (!session.message.startsWith(prefix)) return

    const raw = session.message.slice(prefix.length)
    if (!raw) return

    let matched: undefined | Command
    for (const cmd of this[Symbols.command]) {
      if (matched || !cmd.meta.action) continue
      const result = Command.run(raw, cmd.meta)
      // Command is not matched
      if (result instanceof CommandError && result.value.type === 'unknown') continue

      matched = cmd
      const cancel = cancelFactory()
      this.ctx.emit('before_command', { command: cmd, result, raw, session, cancel: cancel.get() })
      if (cancel.value) continue
      if (result instanceof CommandError) continue

      try {
        const executed = await cmd.meta.action({ args: result.args, options: result.options }, session)
        if (executed !== undefined) session.quick(executed)
        this.ctx.emit('command', {
          command: cmd,
          result: executed,
          raw,
          session
        })
      } catch (error) {
        this.ctx.emit('command', {
          command: matched,
          result: error instanceof CommandError ? error : new CommandError({ type: 'error', error }),
          raw,
          session
        })
      }
    }

    if (matched) return
    // Command is all not matched
    const result = new CommandError({ type: 'unknown', input: raw })
    this.ctx.emit('command', { command: new Command('' as string), result, raw, session })
  }

  private readonly ctx: Context

  public constructor(ctx: Context) {
    this.ctx = ctx
    this.ctx.on('ready', () => {
      for (const bots of this.ctx[Symbols.bot].values()) {
        for (const bot of bots) {
          for (const key of ['sendPrivateMsg', 'sendGroupMsg', 'sendChannelMsg'] as const) {
            ; (bot as unknown as Record<string, unknown>)[key] = new Proxy(bot[key], {
              apply: (target, thisArg, argArray) => {
                const [message, id1, id2] = argArray
                const cancel = cancelFactory()
                this.ctx.emit('before_send', {
                  api: bot,
                  message,
                  cancel: cancel.get(),
                  target:
                    key === 'sendPrivateMsg'
                      ? { type: MessageScope.PRIVATE, userId: id1 }
                      : key === 'sendGroupMsg'
                        ? { type: MessageScope.GROUP, groupId: id1 }
                        : { type: MessageScope.CHANNEL, guildId: id1, channelId: id2 }
                })
                return cancel.value ? { messageId: '', time: 0 } : Reflect.apply(target, thisArg, argArray)
              }
            })
          }
        }
      }
    })
    this.ctx.on('on_message', (session) => this.handleMidware(session))
    this.ctx.on('before_send', (data) => {
      const { api } = data
      api.adapter.status.sentMsg += 1
      api.adapter.status.lastMsgTime = new Date()
    })

    const test = (identity: IdentityType, session: Session) => {
      for (const [key, filter] of this[Symbols.filter].entries()) {
        if (identity.toString().includes(key)) return filter.test(session)
      }
      return true
    }

    this.ctx.on('before_command', (data) => {
      const { identity } = getCommandMeta(data.command) ?? {}
      if (identity && !test(identity, data.session)) {
        data.cancel()
        const result = new CommandError({ type: 'unknown', input: data.raw })
        this.ctx.emit('command', { command: new Command('' as string), result, raw: data.raw, session: data.session })
      }
    })

    this.ctx.on('before_regexp', (data) => {
      const { callback } = Array.from(this[Symbols.regexp]).find(({ match }) => match === data.regexp) ?? {}
      if (!callback) return
      const { identity } = getRegExpMeta(callback) ?? {}
      if (identity && !test(identity, data.session)) data.cancel()
    })

    this.midware((next, session) => {
      const resolves = this[Symbols.promise].get(session.id)
      if (resolves) {
        for (const resolve of resolves) resolve(session.message)
        return
      }

      next()
    }, 10)

    Decorators.setup(this.ctx)
  }

  public midware(callback: MidwareCallback, priority = 100) {
    setMidwareMeta(callback, { identity: this.ctx.identity, priority })
    const data = { callback, priority }
    this[Symbols.midware].add(data)
    return () => this[Symbols.midware].delete(data)
  }

  public command<T extends string>(template: T, config?: CommandConfig) {
    // biome-ignore lint: *
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

  public boardcast(/* type: MessageScope, message: Message */) {
    // const send =
    //   type === 'private'
    //     ? (api: Api) => api.send_on_message(message, 1)
    //     : (api: Api) => api.send_on_message(message, 1);
    // /* this need support of database... */
    // Object.values(this.botStack).forEach((apis) => {
    //   apis.forEach((api) => send(api));
    // });
  }

  public notify(/* message: MessageQuick */) {
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
    return () => this[Symbols.task].delete(task)
  }

  public filter(option: FilterOption) {
    const filterId = randomUUID().slice(0, 12).replaceAll('-', '')
    this[Symbols.filter].set(filterId, new Filter(option))
    // Although ctx.identity maybe empty but only it's not empty can be tested
    return this.ctx.extends(undefined, `${this.ctx.identity?.toString()}_${filterId}`)
  }
}

export default Message
