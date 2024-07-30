import {
  type CommandArgType,
  type Context,
  MessageScope,
  type Session,
  Tsu,
  stringFormat,
  type Message
} from 'kotori-bot'

export const lang = [__dirname, '../locales']

export const config = Tsu.Object({
  print: Tsu.Boolean().default(true).describe('Whether to print the log'),
  notify: Tsu.Boolean().default(true).describe('Whether to send message to master'),
  filterCmd: Tsu.Boolean().default(true).describe('Filter message about command'),
  onHttpRequest: Tsu.Union(
    Tsu.Boolean(),
    Tsu.Custom<('get' | 'post' | 'put' | 'delete' | 'patch' | 'head' | 'options' | 'ws')[]>(
      (input) =>
        Array.isArray(input) &&
        input.every((el) => ['get', 'post', 'put', 'delete', 'patch', 'head', 'options', 'ws'].includes(String(el)))
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
  onGroupRecall: Tsu.Boolean().default(true).describe('Whether to listen to group recall'),
  onPrivateRecall: Tsu.Boolean().default(true).describe('Whether to listen to private recall'),
  onGroupRequest: Tsu.Boolean().default(true).describe('Whether to listen to group request'),
  onPrivateRequest: Tsu.Boolean().default(true).describe('Whether to listen to private request'),
  onGroupMsg: Tsu.Boolean().default(true).describe('Whether to listen to group message'),
  onPrivateMsg: Tsu.Boolean().default(true).describe('Whether to listen to private message')
})

export const inject = ['cache']

// TODO: Supports more events listening and channel

export function main(ctx: Context, cfg: Tsu.infer<typeof config>) {
  const log = (identity: string, ...args: string[]) => {
    if (cfg.print) ctx.logger.label(identity).record(...args)
  }

  const send = (session: Session) => (msg: string | [string, (Message | CommandArgType | undefined)[]]) => {
    if (cfg.filterCmd && session.api.adapter.platform === 'cmd') return
    const isString = typeof msg === 'string'
    session.api.sendPrivateMsg(
      isString ? session.i18n.locale(msg) : session.format(msg[0], msg[1]),
      session.api.adapter.config.master
    )
    log(
      session.api.adapter.identity,
      isString
        ? session.i18n.locale(msg.replace('.msg.', '.log.'))
        : session.format(msg[0].replace('.msg.', '.log.'), msg[1]).toString()
    )
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
      const equaled = session.operatorId === session.userId
      send(session)([
        `requester.msg.decrease.${equaled ? 'leave' : 'kick'}`,
        equaled ? [session.groupId] : [session.operatorId, session.groupId]
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
      send(session)([
        `requester.msg.ban.${session.time > 0 ? 'ban' : 'lift_ban'}`,
        [session.operatorId, session.groupId, session.time ? session.time / 60 : 0]
      ])
    })
  }

  if (cfg.onPrivateRecall || cfg.onGroupRecall) {
    ctx.on('on_delete', (session) => {
      if (session.userId === session.api.adapter.selfId || session.operatorId === session.api.adapter.selfId) return

      if (cfg.onPrivateRecall && session.type === MessageScope.PRIVATE) {
        const message = ctx.cache.get<string>(`${session.api.adapter.identity}${session.messageId}`)
        if (!message) return

        send(session)(['requester.msg.recall.private', [session.userId, message]])
      } else if (cfg.onGroupRecall && session.type === MessageScope.GROUP) {
        const message = ctx.cache.get<string>(`${session.api.adapter.identity}${session.messageId}`)
        if (!message) return

        const equaled = session.operatorId === session.userId
        send(session)([
          `requester.msg.recall.group.${equaled ? 'self' : 'other'}`,
          [session.userId, ...(equaled ? [session.groupId, message] : [session.operatorId, session.groupId, message])]
        ])
      }
    })
  }

  if (cfg.onPrivateRequest || cfg.onGroupRequest) {
    ctx.on('on_request', (session) => {
      if (cfg.onPrivateRequest && session.type === MessageScope.PRIVATE) {
        send(session)(['requester.msg.request.private', [session.userId]])
      } else if (cfg.onGroupMsg && session.type === MessageScope.GROUP) {
        send(session)(['requester.msg.request.group', [session.userId, session.groupId]])
      }
    })
  }

  if (cfg.onGroupMsg || cfg.onPrivateMsg) {
    ctx.on('on_message', (session) => {
      if (session.userId === session.api.adapter.selfId) return
      if (session.type === MessageScope.GROUP && cfg.onGroupRecall) {
        ctx.cache.set(`${session.api.adapter.identity}${session.messageId}`, session.message)
      } else if (session.type === MessageScope.PRIVATE && cfg.onPrivateRecall) {
        ctx.cache.set(`${session.api.adapter.identity}${session.messageId}`, session.message)
      }
      if (cfg.onPrivateMsg && String(session.userId) !== String(session.api.adapter.config.master)) {
        send(session)(['requester.msg.msg.private', [session.userId, session.message]])
      }
    })
  }

  if (cfg.onCommand) {
    ctx.on('command', ({ session, raw }) =>
      log(
        session.api.adapter.identity,
        session.format(`requester.log.command.${session.type === MessageScope.GROUP ? 'group' : 'private'}`, [
          session.userId,
          raw,
          session.groupId
        ])
      )
    )
  }

  if (cfg.onRegexp) {
    ctx.on('regexp', ({ session, raw }) =>
      log(
        session.api.adapter.identity,
        session.format(`requester.log.regexp.${session.type === MessageScope.GROUP ? 'group' : 'private'}`, [
          session.userId,
          raw,
          session.groupId
        ])
      )
    )
  }

  if (cfg.onHttpRequest) {
    const originHttp = ctx.root.http
    const http = ctx.root.http as { -readonly [K in keyof typeof ctx.root.http]: (typeof ctx.root.http)[K] }
    for (const method of cfg.onHttpRequest === true
      ? (['get', 'post', 'put', 'delete', 'patch', 'head', 'options', 'ws'] as const)
      : cfg.onHttpRequest) {
      if (method === 'ws') {
        http.ws = new Proxy(http.ws, {
          apply(target, thisArg, argArray: Parameters<typeof originHttp.ws>) {
            log(method, stringFormat(ctx.i18n.locale('requester.log.http'), [argArray[0]]))
            return Reflect.apply(target, thisArg, argArray)
          }
        })
        return
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
