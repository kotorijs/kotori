import { type AdapterConfig, type Context, MessageScope, Tsu, KotoriError, Adapter } from 'kotori-bot'
import SlackApi from './api'
import SlackElements from './elements'
import { App, type SayFn } from '@slack/bolt'
import { randomInt } from 'node:crypto'

export const config = Tsu.Object({
  token: Tsu.String().describe("Bot's token"),
  appToken: Tsu.String().describe('Application token (Use for socket connection)'),
  signingSecret: Tsu.String().describe('Signing secret')
})

type SlackConfig = Tsu.infer<typeof config> & AdapterConfig

export class SlackAdapter extends Adapter<SlackApi, SlackConfig, SlackElements> {
  public bot: App

  public readonly config: SlackConfig

  public readonly elements: SlackElements = new SlackElements(this)

  public readonly api: SlackApi = new SlackApi(this)

  public readonly platform = 'slack'

  public readonly sayMapping = new Map<string, SayFn>()

  public constructor(ctx: Context, config: SlackConfig, identity: string) {
    super(ctx, config, identity)
    this.config = config
    this.bot = new App({
      token: this.config.token,
      socketMode: true,
      appToken: this.config.appToken,
      signingSecret: this.config.signingSecret
    })
  }

  public handle() {}

  public async start() {
    await this.bot.start()
    this.bot.message('.*', async ({ message, say }) => {
      if (
        (message.subtype === undefined ||
          message.subtype === 'bot_message' ||
          message.subtype === 'file_share' ||
          message.subtype === 'thread_broadcast') &&
        message.text
      ) {
        const params = {
          userId: message.user ?? message.channel,
          message: message.text,
          messageAlt: message.text,
          messageId: randomInt(1000, 10000).toString(),
          sender: {
            nickname: message.user ?? '',
            role: 'member'
          },
          time: new Date(message.ts).getTime()
        } as const
        switch (message.channel_type) {
          case 'channel':
            this.session('on_message', {
              type: MessageScope.CHANNEL,
              channelId: `channel-${message.channel}`,
              guildId: `channel-${message.channel}`,
              ...params
            })
            this.sayMapping.set(`channel-${message.channel}`, say)
            break
          case 'group':
            this.session('on_message', { type: MessageScope.GROUP, groupId: `group-${message.channel}`, ...params })
            this.sayMapping.set(`group-${message.channel}`, say)
            break
          default:
            this.session('on_message', { type: MessageScope.PRIVATE, ...params })
            this.sayMapping.set(message.user ?? message.channel, say)
        }
      }
    })
    this.bot.error(async (error) => this.ctx.emit('error', KotoriError.from(error)))
    this.ctx.emit('connect', {
      type: 'connect',
      mode: 'other',
      adapter: this,
      normal: true,
      address: '@slack/bolt'
    })
    this.online()
  }

  public stop() {
    this.bot.stop()
    this.ctx.emit('connect', {
      type: 'disconnect',
      mode: 'other',
      adapter: this,
      normal: true,
      address: '@slack/bolt'
    })
    this.offline()
  }

  public send() {}
}

export default SlackAdapter
