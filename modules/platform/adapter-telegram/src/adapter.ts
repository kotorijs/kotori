import { HttpsProxyAgent } from 'https-proxy-agent'
import { Adapter, type AdapterConfig, type Context, KotoriError, MessageScope, Tsu } from 'kotori-bot'
import TelegramBot from 'node-telegram-bot-api'
import { SocksProxyAgent } from 'socks-proxy-agent'
import TelegramApi from './api'
import TelegramElements from './elements'

export const config = Tsu.Object({
  token: Tsu.String().describe("Bot's token"),
  proxy: Tsu.String().optional().describe('Proxy address (http, https or socks5)'),
  apiRoot: Tsu.String().optional().describe('Custom Telegram API Server (e.g. local bot api server)')
})

export type TelegramConfig = Tsu.infer<typeof config> & AdapterConfig

function createProxyAgent(proxyUrl?: string) {
  if (!proxyUrl) return undefined
  if (proxyUrl.startsWith('socks')) {
    return new SocksProxyAgent(proxyUrl)
  }
  return new HttpsProxyAgent(proxyUrl)
}

export class TelegramAdapter extends Adapter<TelegramApi, TelegramConfig, TelegramElements> {
  public bot?: TelegramBot

  public readonly config: TelegramConfig

  public readonly elements: TelegramElements = new TelegramElements(this)

  public readonly api: TelegramApi = new TelegramApi(this)

  public readonly platform = 'telegram'

  public selfId = ''

  public constructor(ctx: Context, config: TelegramConfig, identity: string) {
    super(ctx, config, identity)
    this.config = config
  }

  public handle() {}

  public async start() {
    const agent = createProxyAgent(this.config.proxy)
    const requestOptions = agent ? { agent, url: '' } : undefined

    this.bot = new TelegramBot(this.config.token, {
      polling: true,
      baseApiUrl: this.config.apiRoot,
      request: requestOptions
    })

    // 获取 Bot 自身信息以填充 selfId 等元数据
    try {
      const me = await this.bot.getMe()
      this.selfId = String(me.id)
      this.ctx.logger.info(`[telegram/${this.identity}] Logged in as @${me.username} (${me.id})`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      this.ctx.logger.warn(`[telegram/${this.identity}] Failed to get bot info via getMe(): ${msg}`)
    }

    // 消息处理（覆盖私聊、群聊、超大群、频道）
    this.bot.on('message', (msg) => {
      const { message, messageAlt } = this.elements.parseTelegramMessage(msg)
      if (!message && !messageAlt) return

      const fromUser = msg.from
      const userId = fromUser ? String(fromUser.id) : String(msg.chat.id)
      const nickname = [fromUser?.first_name, fromUser?.last_name].filter(Boolean).join(' ') || fromUser?.username || 'Unknown'

      const isBotAdmin = this.config.master !== undefined && String(this.config.master) === userId
      const role: 'owner' | 'admin' | 'member' = isBotAdmin ? 'owner' : 'member'

      const baseParams = {
        messageId: String(msg.message_id),
        message,
        messageAlt,
        userId,
        sender: {
          nickname,
          role
        },
        time: msg.date * 1000,
        meta: {
          chat: msg.chat,
          from: msg.from,
          forwardFrom: msg.forward_from,
          forwardDate: msg.forward_date,
          replyToMessage: msg.reply_to_message
        }
      }

      switch (msg.chat.type) {
        case 'private':
          this.session('on_message', {
            type: MessageScope.PRIVATE,
            ...baseParams
          })
          break

        case 'group':
        case 'supergroup': {
          const groupId = String(msg.chat.id)
          this.session('on_message', {
            type: MessageScope.GROUP,
            ...baseParams,
            groupId
          })
          break
        }

        case 'channel': {
          const channelId = String(msg.chat.id)
          this.session('on_message', {
            type: MessageScope.CHANNEL,
            ...baseParams,
            channelId,
            guildId: channelId
          })
          break
        }

        default:
          this.session('on_message', {
            type: MessageScope.PRIVATE,
            ...baseParams
          })
      }
    })

    // 群成员变动事件
    this.bot.on('new_chat_members', (msg) => {
      const groupId = String(msg.chat.id)
      const operatorId = msg.from ? String(msg.from.id) : ''
      for (const member of msg.new_chat_members ?? []) {
        this.session('on_group_increase', {
          type: MessageScope.GROUP,
          groupId,
          userId: String(member.id),
          operatorId,
          time: msg.date * 1000,
          meta: { member, chat: msg.chat }
        })
      }
    })

    this.bot.on('left_chat_member', (msg) => {
      if (!msg.left_chat_member) return
      const groupId = String(msg.chat.id)
      const operatorId = msg.from ? String(msg.from.id) : ''
      this.session('on_group_decrease', {
        type: MessageScope.GROUP,
        groupId,
        userId: String(msg.left_chat_member.id),
        operatorId,
        time: msg.date * 1000,
        meta: { member: msg.left_chat_member, chat: msg.chat }
      })
    })

    // 错误处理与重连日志
    this.bot.on('webhook_error', (error) => {
      this.ctx.emit('error', KotoriError.from(error, this.ctx.identity?.toString()))
    })
    this.bot.on('polling_error', (error) => {
      this.ctx.emit('error', KotoriError.from(error, this.ctx.identity?.toString()))
    })
    this.bot.on('error', (error) => {
      this.ctx.emit('error', KotoriError.from(error.message, this.ctx.identity?.toString()))
    })

    this.ctx.emit('connect', {
      type: 'connect',
      mode: 'other',
      adapter: this,
      normal: true,
      address: 'Telegram Bot API'
    })
    this.online()
  }

  public async stop() {
    try {
      if (this.bot?.isPolling()) {
        await this.bot.stopPolling()
      }
      await this.bot?.close()
    } catch {}
    this.ctx.emit('connect', {
      type: 'disconnect',
      mode: 'other',
      adapter: this,
      normal: true,
      address: 'Telegram Bot API'
    })
    this.offline()
  }

  public send(action: string, params?: object) {
    if (!this.bot || this.status.value !== 'online') return
    return (this.api as unknown as Record<string, (...args: unknown[]) => unknown>)[action]?.(params)
  }
}

export default TelegramAdapter
