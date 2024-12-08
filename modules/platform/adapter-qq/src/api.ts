import { Api, MessageList, type Message, MessageSingle } from 'kotori-bot'
import type QQAdapter from './adapter'
import { MEDIA_KEY } from './constants'

export default class QQApi extends Api {
  public adapter: QQAdapter

  public constructor(adapter: QQAdapter) {
    super(adapter)
    this.adapter = adapter
  }

  public getSupportedEvents(): ReturnType<Api['getSupportedEvents']> {
    return ['on_message']
  }

  public async sendGroupMsg(message: Message, groupId: string) {
    const handle = this.adapter.elements.decode(message)
    const media = typeof message === 'string' ? [] : Reflect.getMetadata(MEDIA_KEY, message) ?? []
    const { id, timestamp } = await this.adapter.send('sendGroupMsg', { message: handle, groupId, media })
    this.adapter.ctx.emit('send', { api: this as unknown as Api, messageId: id })
    return { messageId: id, time: new Date(timestamp).getTime() }
  }

  public async sendChannelMsg(message: Message, guildId: string, channelId: string) {
    const content = message.toString()
    const imageHandle = message instanceof MessageList ? message.pick('image') : null
    const image =
      imageHandle && imageHandle.length > 0
        ? imageHandle[imageHandle.length - 1].data.content
        : message instanceof MessageSingle
          ? message.data.type === 'image'
            ? message.data.content
            : undefined
          : undefined
    const { id, timestamp } = await this.adapter.send('sendChannelMsg', { content, image, guildId, channelId })
    this.adapter.ctx.emit('send', { api: this as unknown as Api, messageId: id })
    return { messageId: id, time: new Date(timestamp).getTime() }
  }
}
