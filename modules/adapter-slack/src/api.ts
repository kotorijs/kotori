import { Api, type Message } from 'kotori-bot'
import type SlackAdapter from './adapter'

export class SlackApi extends Api {
  public readonly adapter: SlackAdapter

  public constructor(adapter: SlackAdapter) {
    super(adapter)
    this.adapter = adapter
  }

  public getSupportedEvents(): ReturnType<Api['getSupportedEvents']> {
    return ['on_message']
  }

  public async sendPrivateMsg(message: Message, userId: string) {
    const res = await this.adapter.sayMapping.get(userId)?.(this.adapter.elements.decode(message))
    this.adapter.ctx.emit('send', { api: this, messageId: '' })
    return { messageId: '', time: new Date(res?.message?.ts ?? 0).getTime() }
  }

  public async sendGroupMsg(message: Message, groupId: string) {
    const res = await this.adapter.sayMapping.get(`group-${groupId}`)?.(this.adapter.elements.decode(message))
    this.adapter.ctx.emit('send', { api: this, messageId: '' })
    return { messageId: '', time: new Date(res?.message?.ts ?? 0).getTime() }
  }

  public async sendChannelMsg(message: Message, guildId: string) {
    const res = await this.adapter.sayMapping.get(`channel-${guildId}`)?.(this.adapter.elements.decode(message))
    this.adapter.ctx.emit('send', { api: this, messageId: '' })
    return { messageId: '', time: new Date(res?.message?.ts ?? 0).getTime() }
  }
}

export default SlackApi
