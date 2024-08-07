import { type AdapterConfig, type Context, MessageScope, Tsu, KotoriError, Adapter } from 'kotori-bot'
import TelegramApi from './api'
import TelegramElements from './elements'
import TelegramBot from 'node-telegram-bot-api'
import { SocksProxyAgent } from 'socks-proxy-agent'

export const config = Tsu.Object({
  token: Tsu.String().describe("Bot's token"),
  proxy: Tsu.String().optional().describe('Proxy address (if you are in China)')
})

type TelegramConfig = Tsu.infer<typeof config> & AdapterConfig

export class TelegramAdapter extends Adapter<TelegramApi, TelegramConfig, TelegramElements> {
  public bot?: TelegramBot

  public readonly config: TelegramConfig

  public readonly elements: TelegramElements = new TelegramElements(this)

  public readonly api: TelegramApi = new TelegramApi(this)

  public readonly platform = 'telegram'

  public constructor(ctx: Context, config: TelegramConfig, identity: string) {
    super(ctx, config, identity)
    this.config = config
  }

  public handle() {}

  public start() {
    this.bot = new TelegramBot(this.config.token, {
      polling: true,
      request: this.config.proxy ? { agent: new SocksProxyAgent(this.config.proxy), url: '' } : undefined
    })
    this.bot.on('message', (msg) => {
      if (!msg.text) return
      const params = {
        messageId: msg.message_id.toString(),
        message: msg.text,
        messageAlt: msg.text,
        userId: msg.from?.id.toString() ?? '',
        sender: {
          nickname: msg.from?.username ?? '',
          role: 'member' as const
        },
        time: msg.date
      }

      switch (msg.chat.type) {
        case 'private':
          this.session('on_message', { type: MessageScope.PRIVATE, ...params })
          break
        case 'group':
          this.session('on_message', { type: MessageScope.GROUP, ...params, groupId: msg.chat.id.toString() })
          break
        default:
          this.session('on_message', {
            type: MessageScope.CHANNEL,
            ...params,
            channelId: msg.chat.id.toString(),
            guildId: msg.chat.id.toString()
          })
      }
    })
    this.bot.on('webhook_error', (error) =>
      this.ctx.emit('error', KotoriError.from(error, this.ctx.identity?.toString()))
    )
    this.bot.on('polling_error', (error) =>
      this.ctx.emit('error', KotoriError.from(error, this.ctx.identity?.toString()))
    )
    this.bot.on('error', (error) =>
      this.ctx.emit('error', KotoriError.from(error.message, this.ctx.identity?.toString()))
    )
    /* ws mode handle */
    this.ctx.emit('connect', {
      type: 'connect',
      mode: 'other',
      adapter: this,
      normal: true,
      address: 'node-telegram-bot-api'
    })
    this.online()
  }

  public stop() {
    this.bot?.close()
    this.offline()
  }

  public send() {}
}

export default TelegramAdapter
