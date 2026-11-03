import { Api, type Message, MessageList, MessageSingle, type UserInfoResponse } from 'kotori-bot'
import type QQAdapter from './adapter'
import { MEDIA_KEY, REPLY_KEY } from './constants'

export default class QQApi extends Api {
  public adapter: QQAdapter

  public constructor(adapter: QQAdapter) {
    super(adapter)
    this.adapter = adapter
  }

  public getSupportedEvents(): ReturnType<Api['getSupportedEvents']> {
    return ['on_message', 'on_group_increase', 'on_group_decrease', 'on_friend_increase', 'on_friend_decrease']
  }

  public async sendPrivateMsg(message: Message, userId: string) {
    const handle = this.adapter.elements.decode(message)
    const media = typeof message === 'string' ? [] : (Reflect.getMetadata(MEDIA_KEY, message) ?? [])
    const msgId = typeof message === 'string' ? undefined : Reflect.getMetadata(REPLY_KEY, message)
    const res = await this.adapter.send('sendPrivateMsg', { message: handle, userId, media, msgId })
    const id = res?.id ?? ''
    const time = res?.timestamp ? new Date(res.timestamp).getTime() : Date.now()
    this.adapter.ctx.emit('send', { api: this as unknown as Api, messageId: id })
    return { messageId: id, time }
  }

  public async sendGroupMsg(message: Message, groupId: string) {
    const handle = this.adapter.elements.decode(message)
    const media = typeof message === 'string' ? [] : (Reflect.getMetadata(MEDIA_KEY, message) ?? [])
    const msgId = typeof message === 'string' ? undefined : Reflect.getMetadata(REPLY_KEY, message)
    const res = await this.adapter.send('sendGroupMsg', { message: handle, groupId, media, msgId })
    const id = res?.id ?? ''
    const time = res?.timestamp ? new Date(res.timestamp).getTime() : Date.now()
    this.adapter.ctx.emit('send', { api: this as unknown as Api, messageId: id })
    return { messageId: id, time }
  }

  public async sendChannelMsg(message: Message, guildId: string, channelId: string) {
    const content = this.adapter.elements.decode(message)
    const msgId = typeof message === 'string' ? undefined : Reflect.getMetadata(REPLY_KEY, message)
    const imageHandle = message instanceof MessageList ? message.pick('image') : null
    const image =
      imageHandle && imageHandle.length > 0
        ? imageHandle[imageHandle.length - 1].data.content
        : message instanceof MessageSingle
          ? message.data.type === 'image'
            ? message.data.content
            : undefined
          : undefined
    const res = await this.adapter.send('sendChannelMsg', { content, image, guildId, channelId, msgId })
    const id = res?.id ?? ''
    const time = res?.timestamp ? new Date(res.timestamp).getTime() : Date.now()
    this.adapter.ctx.emit('send', { api: this as unknown as Api, messageId: id })
    return { messageId: id, time }
  }

  public async deleteMsg(messageId: string, meta: { groupId?: string; userId?: string; channelId?: string; guildId?: string } = {}) {
    await this.adapter.send('deleteMsg', { messageId, ...meta })
  }

  public async getSelfInfo() {
    return this.adapter.getSelfInfo()
  }

  public async getUserInfo(userId: string, meta: { guildId?: string } = {}): Promise<UserInfoResponse> {
    if (userId === this.adapter.selfId || userId === '@me') {
      const self = await this.adapter.getSelfInfo()
      return {
        userId: self.userId,
        username: self.username,
        userDisplayname: self.userDisplayname,
        userRemark: ''
      }
    }
    if (meta.guildId) {
      try {
        const member = await this.adapter.req<{ user?: { id?: string; username?: string; avatar?: string }; nick?: string }>(
          `guilds/${meta.guildId}/members/${userId}`,
          undefined,
          'get'
        )
        return {
          userId: member.user?.id ?? userId,
          username: member.user?.username ?? '',
          userDisplayname: member.nick || member.user?.username || '',
          userRemark: ''
        }
      } catch {
        // fallback
      }
    }
    return {
      userId,
      username: userId,
      userDisplayname: userId,
      userRemark: ''
    }
  }

  public async getGroupInfo(groupId: string) {
    return {
      groupId,
      groupName: groupId
    }
  }

  public async getChannelInfo(channelId: string) {
    try {
      const data = await this.adapter.req<{ id: string; name: string }>(`channels/${channelId}`, undefined, 'get')
      return {
        channelId: data.id,
        channelName: data.name
      }
    } catch {
      return {
        channelId,
        channelName: channelId
      }
    }
  }
}
