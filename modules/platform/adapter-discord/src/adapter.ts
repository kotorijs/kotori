import { Client, GatewayIntentBits, type Message, REST } from 'discord.js'
import { Adapter, type AdapterConfig, type Context, KotoriError, MessageScope, Tsu } from 'kotori-bot'
import DiscordApi from './api'
import DiscordElements from './elements'

export const config = Tsu.Object({
  token: Tsu.String().describe("Bot's token")
})

type DiscordConfig = Tsu.infer<typeof config> & AdapterConfig

export class DiscordAdapter extends Adapter<DiscordApi, DiscordConfig, DiscordElements> {
  public rest: REST

  public client: Client

  public readonly config: DiscordConfig

  public readonly elements: DiscordElements = new DiscordElements(this)

  public readonly api: DiscordApi = new DiscordApi(this)

  public readonly platform = 'discord'

  public readonly replyMapping = new Map<string, Message['reply']>()

  public constructor(ctx: Context, config: DiscordConfig, identity: string) {
    super(ctx, config, identity)
    this.config = config
    this.rest = new REST({ version: '10' }).setToken(this.config.token)
    this.client = new Client({ intents: [GatewayIntentBits.Guilds] })
  }

  public handle() { }

  public async start() {
    this.client.on('ready', () => {
      this.ctx.emit('connect', {
        type: 'connect',
        mode: 'other',
        adapter: this,
        normal: true,
        address: 'discord.js'
      })
      this.online()
    })
    this.client.on('error', (error) => this.ctx.emit('error', KotoriError.from(error, this.ctx.identity?.toString())))
    this.client.on('messageCreate', async (message) => {
      this.session('on_message', {
        type: MessageScope.CHANNEL,
        channelId: message.channelId,
        guildId: message.guildId ?? '',
        userId: message.author.id,
        message: message.content,
        messageAlt: message.content,
        messageId: message.id,
        sender: {
          nickname: message.author.username
        },
        time: new Date(message.createdTimestamp).getTime()
      })
      this.replyMapping.set(`${message.channelId}${message.guildId ?? ''}`, message.reply.bind(message))
    })
    this.client.on('messageDelete', (message) => {
      this.session('on_message_delete', {
        type: MessageScope.CHANNEL,
        channelId: message.channelId,
        guildId: message.guildId ?? '',
        operatorId: message.author?.id ?? '',
        userId: message.author?.id ?? '',
        messageId: message.id,
        time: new Date(message.createdTimestamp).getTime()
      })
    })
    this.client.login(this.config.token)
  }

  public stop() {
    this.client.destroy()
    this.ctx.emit('connect', {
      type: 'disconnect',
      mode: 'other',
      adapter: this,
      normal: true,
      address: 'discord.js'
    })
    this.offline()
  }

  public send() { }
}

export default DiscordAdapter
