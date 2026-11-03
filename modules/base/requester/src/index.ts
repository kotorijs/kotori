import { type CommandArgType, type Context, type Message, MessageScope, MessageSingle, type Session, stringFormat, Tsu } from 'kotori-bot'

export const lang = [__dirname, '../locales']

export const config = Tsu.Object({
  print: Tsu.Boolean().default(true).describe('Whether to print the log'),
  notify: Tsu.Boolean().default(true).describe('Whether to send message to master'),
  filterCmd: Tsu.Boolean().default(true).describe('Filter message about command'),
  onHttpRequest: Tsu.Union(
    Tsu.Boolean(),
    Tsu.Custom<('get' | 'post' | 'put' | 'delete' | 'patch' | 'head' | 'options' | 'ws')[]>(
      (input) =>
        Array.isArray(input) && input.every((el) => ['get', 'post', 'put', 'delete', 'patch', 'head', 'options', 'ws'].includes(String(el)))
    )
  )
    .default(['get', 'post', 'put', 'delete', 'patch'])
    .describe('Whether to listen to http request (only print)'),
  onRegexp: Tsu.Boolean().default(true).describe('Whether to listen to regexp (only print)'),
  onCommand: Tsu.Boolean().default(true).describe('Whether to listen to command (only print)'),
  onBotGroupIncrease: Tsu.Boolean().default(true).describe('Whether to listen to bot group increase'),
  onBotGroupDecrease: Tsu.Boolean().default(true).describe('Whether to listen to bot group decrease'),
  onBotGroupAdmin: Tsu.Boolean().default(true).describe('Whether to listen to bot group admin'),
  onBotGroupBan: Tsu.Boolean().default(true).describe('Whether to listen to bot group ban'),
  onBotGroupWholeBan: Tsu.Boolean().default(true).describe('Whether to listen to group whole ban'),
  onBotGuildIncrease: Tsu.Boolean().default(true).describe('Whether to listen to bot guild increase'),
  onBotGuildDecrease: Tsu.Boolean().default(true).describe('Whether to listen to bot guild decrease'),
  onBotChannelIncrease: Tsu.Boolean().default(true).describe('Whether to listen to bot channel increase'),
  onBotChannelDecrease: Tsu.Boolean().default(true).describe('Whether to listen to bot channel decrease'),
  onFriendIncrease: Tsu.Boolean().default(true).describe('Whether to listen to friend increase'),
  onFriendDecrease: Tsu.Boolean().default(true).describe('Whether to listen to friend decrease'),
  onGroupRecall: Tsu.Boolean().default(true).describe('Whether to listen to group recall'),
  onPrivateRecall: Tsu.Boolean().default(true).describe('Whether to listen to private recall'),
  onChannelRecall: Tsu.Boolean().default(true).describe('Whether to listen to channel recall'),
  onGroupRequest: Tsu.Boolean().default(true).describe('Whether to listen to group request'),
  onPrivateRequest: Tsu.Boolean().default(true).describe('Whether to listen to private request'),
  onGroupMsg: Tsu.Boolean().default(true).describe('Whether to listen to group message mentioning bot'),
  onPrivateMsg: Tsu.Boolean().default(true).describe('Whether to listen to private message'),
  onChannelMsg: Tsu.Boolean().default(true).describe('Whether to listen to channel message')
})

export const inject = ['cache']

export function main(ctx: Context, cfg: Tsu.infer<typeof config>) {
  const log = (identity: string, ...args: string[]) => {
    if (cfg.print) ctx.logger.label(identity).record(...args)
  }

  const send = (session: Session) => (msg: string | [string, (Message | CommandArgType | undefined)[]]) => {
    const isString = typeof msg === 'string'
    const master = session.api.adapter.config.master

    if (cfg.notify && master) {
      if (!(cfg.filterCmd && session.api.adapter.platform === 'cmd')) {
        const notifyContent = isString ? session.i18n.locale(msg) : session.format(msg[0], msg[1])
        session.api.sendPrivateMsg(notifyContent, master).catch((err) => {
          ctx.logger.warn(`[requester] Failed to notify master: ${err instanceof Error ? err.message : String(err)}`)
        })
      }
    }

    const logKey = isString ? msg.replace('.msg.', '.log.') : msg[0].replace('.msg.', '.log.')
    const logText = isString ? session.i18n.locale(logKey) : session.format(logKey, msg[1]).toString()

    log(`${session.api.adapter.platform}/${session.api.adapter.identity}`, logText)
  }

  if (cfg.onBotGroupIncrease) {
    ctx.on('on_group_increase', (session) => {
      if (session.userId !== session.api.adapter.selfId) return
      send(session)(['requester.msg.increase', [session.groupId]])
    })
  }

  if (cfg.onBotGroupDecrease) {
    ctx.on('on_group_decrease', (session) => {
      if (session.userId !== session.api.adapter.selfId) return
      const isLeave = session.operatorId === session.userId || session.operatorId.toString() === '0'
      send(session)([
        `requester.msg.decrease.${isLeave ? 'leave' : 'kick'}`,
        isLeave ? [session.groupId] : [session.operatorId, session.groupId]
      ])
    })
  }

  if (cfg.onBotGroupAdmin) {
    ctx.on('on_group_admin', (session) => {
      if (session.userId !== session.api.adapter.selfId) return
      send(session)([`requester.msg.admin.${session.operation}`, [session.groupId]])
    })
  }

  if (cfg.onBotGroupBan) {
    ctx.on('on_group_ban', (session) => {
      if (session.userId !== session.api.adapter.selfId) return
      const isBan = session.duration > 0
      send(session)([
        `requester.msg.ban.${isBan ? 'ban' : 'lift_ban'}`,
        [session.operatorId, session.groupId, isBan ? Math.round(session.duration / 60) : 0]
      ])
    })
  }

  if (cfg.onBotGroupWholeBan) {
    ctx.on('on_group_whole_ban', (session) => {
      send(session)([
        `requester.msg.group.whole_ban.${session.operation === 'set' ? 'ban' : 'lift_ban'}`,
        [session.operatorId, session.groupId]
      ])
    })
  }

  if (cfg.onBotGuildIncrease) {
    ctx.on('on_guild_increase', (session) => {
      if (session.userId && session.userId !== session.api.adapter.selfId) return
      send(session)(['requester.msg.guild.increase', [session.guildId]])
    })
  }

  if (cfg.onBotGuildDecrease) {
    ctx.on('on_guild_decrease', (session) => {
      if (session.userId && session.userId !== session.api.adapter.selfId) return
      send(session)(['requester.msg.guild.decrease', [session.guildId]])
    })
  }

  if (cfg.onBotChannelIncrease) {
    ctx.on('on_channel_increase', (session) => {
      send(session)(['requester.msg.channel.increase', [session.channelId]])
    })
  }

  if (cfg.onBotChannelDecrease) {
    ctx.on('on_channel_decrease', (session) => {
      send(session)(['requester.msg.channel.decrease', [session.channelId]])
    })
  }

  if (cfg.onFriendIncrease) {
    ctx.on('on_friend_increase', (session) => {
      send(session)(['requester.msg.friend.increase', [session.userId]])
    })
  }

  if (cfg.onFriendDecrease) {
    ctx.on('on_friend_decrease', (session) => {
      send(session)(['requester.msg.friend.decrease', [session.userId]])
    })
  }

  if (cfg.onPrivateRecall || cfg.onGroupRecall || cfg.onChannelRecall) {
    ctx.on('on_message_delete', (session) => {
      if (session.userId === session.api.adapter.selfId || session.operatorId === session.api.adapter.selfId) return

      const cacheKey = `${session.api.adapter.identity}${session.messageId}`
      const message = ctx.cache.get<string>(cacheKey)
      if (!message) return

      if (cfg.onPrivateRecall && session.type === MessageScope.PRIVATE) {
        send(session)(['requester.msg.recall.private', [session.userId, message]])
      } else if (cfg.onGroupRecall && session.type === MessageScope.GROUP) {
        const equaled = session.operatorId === session.userId || !session.operatorId
        send(session)([
          `requester.msg.recall.group.${equaled ? 'self' : 'other'}`,
          equaled ? [session.userId, session.groupId, message] : [session.userId, session.operatorId, session.groupId, message]
        ])
      } else if (cfg.onChannelRecall && session.type === MessageScope.CHANNEL) {
        send(session)(['requester.msg.recall.channel', [session.userId, session.channelId || session.guildId, message]])
      }
    })
  }

  if (cfg.onPrivateRequest || cfg.onGroupRequest) {
    ctx.on('on_request', (session) => {
      if (cfg.onPrivateRequest && session.type === MessageScope.PRIVATE) {
        send(session)(['requester.msg.request.private', [session.userId]])
      } else if (cfg.onGroupRequest && session.type === MessageScope.GROUP) {
        send(session)(['requester.msg.request.group', [session.userId, session.groupId]])
      }
    })
  }

  if (cfg.onGroupMsg || cfg.onPrivateMsg || cfg.onChannelMsg || cfg.onGroupRecall || cfg.onPrivateRecall || cfg.onChannelRecall) {
    ctx.on('on_message', (session) => {
      if (session.userId === session.api.adapter.selfId) return

      const messageContent = session.message.toString()
      const cacheKey = `${session.api.adapter.identity}${session.messageId}`

      if (session.type === MessageScope.GROUP && cfg.onGroupRecall) {
        ctx.cache.set(cacheKey, messageContent)
      } else if (session.type === MessageScope.PRIVATE && cfg.onPrivateRecall) {
        ctx.cache.set(cacheKey, messageContent)
      } else if (session.type === MessageScope.CHANNEL && cfg.onChannelRecall) {
        ctx.cache.set(cacheKey, messageContent)
      }

      if (session.userId === session.api.adapter.config.master) return

      if (cfg.onPrivateMsg && session.type === MessageScope.PRIVATE) {
        send(session)(['requester.msg.msg.private', [session.userId, session.message]])
      } else if (cfg.onGroupMsg && session.type === MessageScope.GROUP) {
        const selfId = session.api.adapter.selfId
        let isMentioned = false
        if (selfId && session.messageAlt?.includes(`@${selfId}`)) {
          isMentioned = true
        } else if (
          session.message instanceof MessageSingle &&
          session.message.data.type === 'mention' &&
          (session.message.data as { userId: string }).userId === selfId
        ) {
          isMentioned = true
        } else if (session.message && typeof session.message === 'object' && Symbol.iterator in (session.message as object)) {
          for (const el of session.message as Iterable<{ data?: { type?: string; userId?: string } }>) {
            if (el?.data?.type === 'mention' && el?.data?.userId === selfId) {
              isMentioned = true
              break
            }
          }
        }
        if (isMentioned) {
          send(session)(['requester.msg.msg.group', [session.userId, session.groupId, session.message]])
        }
      } else if (cfg.onChannelMsg && session.type === MessageScope.CHANNEL) {
        send(session)(['requester.msg.msg.channel', [session.userId, session.channelId || session.guildId, session.message]])
      }
    })
  }

  if (cfg.onCommand) {
    ctx.on('command', ({ session, raw }) => {
      const scope = session.type === MessageScope.GROUP ? 'group' : session.type === MessageScope.CHANNEL ? 'channel' : 'private'
      const targetId = session.type === MessageScope.GROUP ? session.groupId : session.channelId || session.guildId
      log(
        `${session.api.adapter.platform}/${session.api.adapter.identity}`,
        session.format(`requester.log.command.${scope}`, [session.userId, raw, targetId])
      )
    })
  }

  if (cfg.onRegexp) {
    ctx.on('regexp', ({ session, raw }) => {
      const scope = session.type === MessageScope.GROUP ? 'group' : session.type === MessageScope.CHANNEL ? 'channel' : 'private'
      const targetId = session.type === MessageScope.GROUP ? session.groupId : session.channelId || session.guildId
      log(
        `${session.api.adapter.platform}/${session.api.adapter.identity}`,
        session.format(`requester.log.regexp.${scope}`, [session.userId, raw, targetId])
      )
    })
  }

  if (cfg.onHttpRequest) {
    const originHttp = ctx.root.http
    const http = ctx.root.http as { -readonly [K in keyof typeof ctx.root.http]: (typeof ctx.root.http)[K] }
    const methods =
      cfg.onHttpRequest === true ? (['get', 'post', 'put', 'delete', 'patch', 'head', 'options', 'ws'] as const) : cfg.onHttpRequest

    for (const method of methods) {
      if (method === 'ws') {
        http.ws = new Proxy(http.ws, {
          apply(target, thisArg, argArray: Parameters<typeof originHttp.ws>) {
            log(method, stringFormat(ctx.i18n.locale('requester.log.http'), [argArray[0]]))
            return Reflect.apply(target, thisArg, argArray)
          }
        })
        continue
      }
      http[method] = new Proxy(http[method], {
        apply(target, thisArg, argArray: Parameters<(typeof originHttp)[typeof method]>) {
          log(method, stringFormat(ctx.i18n.locale('requester.log.http'), [argArray[0]]))
          return Reflect.apply(target, thisArg, argArray)
        }
      })
    }
  }
}
