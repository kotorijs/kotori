import { Api, type Message } from 'kotori-bot'
import type DiscordAdapter from './adapter'

export class DiscordApi extends Api {
  public readonly adapter: DiscordAdapter

  public constructor(adapter: DiscordAdapter) {
    super(adapter)
    this.adapter = adapter
  }

  public getSupportedEvents(): ReturnType<Api['getSupportedEvents']> {
    return ['on_message']
  }

  public async sendPrivateMsg(message: Message, userId: string) {
    const res = await this.adapter.replyMapping.get(userId)?.(this.adapter.elements.decode(message))
    this.adapter.ctx.emit('send', { api: this, messageId: res?.id ?? '' })

    return { messageId: res?.id ?? '', time: new Date(res?.createdTimestamp ?? 0).getTime() }
  }

  public async sendGroupMsg(message: Message, groupId: string) {
    const res = await this.adapter.replyMapping.get(`group-${groupId}`)?.(this.adapter.elements.decode(message))
    this.adapter.ctx.emit('send', { api: this, messageId: res?.id ?? '' })

    return { messageId: res?.id ?? '', time: new Date(res?.createdTimestamp ?? 0).getTime() }
  }

  public async sendChannelMsg(message: Message, guildId: string) {
    const res = await this.adapter.replyMapping.get(`channel-${guildId}`)?.(this.adapter.elements.decode(message))
    this.adapter.ctx.emit('send', { api: this, messageId: res?.id ?? '' })
    return { messageId: res?.id ?? '', time: new Date(res?.createdTimestamp ?? 0).getTime() }
  }
}

export default DiscordApi
