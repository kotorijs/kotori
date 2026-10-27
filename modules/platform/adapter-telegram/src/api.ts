import { createReadStream, existsSync } from 'node:fs'
import type { Stream } from 'node:stream'
import { Api, type Message, MessageList, MessageSingle } from 'kotori-bot'
import type TelegramAdapter from './adapter'

export class TelegramApi extends Api {
  public readonly adapter: TelegramAdapter

  public constructor(adapter: TelegramAdapter) {
    super(adapter)
    this.adapter = adapter
  }

  public getSupportedEvents(): ReturnType<Api['getSupportedEvents']> {
    return ['on_message', 'on_group_increase', 'on_group_decrease']
  }

  /**
   * 将本地文件路径、HTTP URL 或 Buffer 转为 node-telegram-bot-api 可接受的参数
   */
  private resolveMediaSource(source: string | Buffer): string | Stream | Buffer {
    if (Buffer.isBuffer(source)) return source
    if (typeof source === 'string') {
      if (source.startsWith('http://') || source.startsWith('https://')) {
        return source
      }
      if (existsSync(source)) {
        return createReadStream(source)
      }
    }
    return source
  }

  /**
   * 发送媒体类消息
   */
  private async sendMedia(chatId: string | number, message: Message, replyToMessageId?: number) {
    if (!this.adapter.bot || typeof message === 'string') return
    const options = replyToMessageId ? { reply_to_message_id: replyToMessageId } : undefined

    if (message instanceof MessageList || Array.isArray(message)) {
      for await (const el of message) {
        if (el.data.type !== 'text' && el.data.type !== 'reply' && el.data.type !== 'mention' && el.data.type !== 'mentionAll') {
          await this.sendMedia(chatId, el, replyToMessageId)
        }
      }
      return
    }

    switch (message.data.type) {
      case 'image':
        return await this.adapter.bot.sendPhoto(chatId, this.resolveMediaSource(message.data.content), options)
      case 'audio':
        return await this.adapter.bot.sendAudio(chatId, this.resolveMediaSource(message.data.content), options)
      case 'video':
        return await this.adapter.bot.sendVideo(chatId, this.resolveMediaSource(message.data.content), options)
      case 'voice':
        return await this.adapter.bot.sendVoice(chatId, this.resolveMediaSource(message.data.content), options)
      case 'file':
        return await this.adapter.bot.sendDocument(chatId, this.resolveMediaSource(message.data.content), options)
      case 'location':
        return await this.adapter.bot.sendLocation(chatId, message.data.latitude, message.data.longitude, options)
      default:
        return undefined
    }
  }

  /**
   * 统一发送入口
   */
  private async sendMsg(chatId: string | number, message: Message) {
    if (!this.adapter.bot) {
      throw new Error(`[telegram/${this.adapter.identity}] Bot instance not initialized.`)
    }

    // 提取 reply_to_message_id（若消息中含有 reply 段）
    let replyToMessageId: number | undefined
    if (message instanceof MessageSingle && message.data.type === 'reply') {
      replyToMessageId = Number(message.data.messageId)
    } else if (message instanceof MessageList || Array.isArray(message)) {
      for (const el of message) {
        if (el.data.type === 'reply') {
          replyToMessageId = Number(el.data.messageId)
          break
        }
      }
    }

    const text = this.adapter.elements.decode(message)
    let lastResult: { message_id: number; date: number } | undefined

    if (text.trim()) {
      const sendOptions = replyToMessageId ? { reply_to_message_id: replyToMessageId } : undefined
      lastResult = await this.adapter.bot.sendMessage(chatId, text, sendOptions)
    }

    // 发送媒体段
    const mediaResult = await this.sendMedia(chatId, message, replyToMessageId)
    if (mediaResult) lastResult = mediaResult

    const messageId = lastResult ? String(lastResult.message_id) : ''
    const time = lastResult ? lastResult.date * 1000 : Date.now()

    this.adapter.ctx.emit('send', { api: this, messageId })
    return { messageId, time }
  }

  public async sendPrivateMsg(message: Message, userId: string) {
    return this.sendMsg(userId, message)
  }

  public async sendGroupMsg(message: Message, groupId: string) {
    return this.sendMsg(groupId, message)
  }

  public async sendChannelMsg(message: Message, guildId: string, channelId: string) {
    return this.sendMsg(channelId || guildId, message)
  }

  /**
   * 撤回消息
   */
  public async deleteMsg(messageId: string, meta: { chatId?: string | number } = {}) {
    if (!this.adapter.bot || !meta.chatId) return
    try {
      await this.adapter.bot.deleteMessage(meta.chatId, Number(messageId))
    } catch (e: unknown) {
      const err = e instanceof Error ? e.message : String(e)
      this.adapter.ctx.logger.warn(`[telegram/${this.adapter.identity}] deleteMsg failed: ${err}`)
    }
  }

  /**
   * 获取 Bot 自身账号信息
   */
  public async getSelfInfo() {
    if (!this.adapter.bot) throw new Error('Bot not started')
    const me = await this.adapter.bot.getMe()
    const name = [me.first_name, me.last_name].filter(Boolean).join(' ') || me.username || ''
    return {
      userId: String(me.id),
      username: me.username ?? name,
      userDisplayname: name
    }
  }

  /**
   * 获取用户信息
   */
  public async getUserInfo(userId: string) {
    if (!this.adapter.bot) throw new Error('Bot not started')
    const chat = await this.adapter.bot.getChat(userId)
    const name = [chat.first_name, chat.last_name].filter(Boolean).join(' ') || chat.username || 'User'
    return {
      userId: String(chat.id),
      username: chat.username ?? name,
      userDisplayname: name,
      userRemark: chat.description ?? ''
    }
  }

  /**
   * 获取群组信息
   */
  public async getGroupInfo(groupId: string) {
    if (!this.adapter.bot) throw new Error('Bot not started')
    const chat = await this.adapter.bot.getChat(groupId)
    return {
      groupId: String(chat.id),
      groupName: chat.title ?? 'Telegram Group'
    }
  }

  /**
   * 获取群成员数量
   */
  public async getGroupMemberCount(groupId: string) {
    if (!this.adapter.bot) throw new Error('Bot not started')
    return await this.adapter.bot.getChatMemberCount(groupId)
  }

  /**
   * 获取群管理员列表
   */
  public async getGroupAdminList(groupId: string) {
    if (!this.adapter.bot) throw new Error('Bot not started')
    const admins = await this.adapter.bot.getChatAdministrators(groupId)
    return admins.map((admin) => {
      const user = admin.user
      const nickname = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username || ''
      return {
        userId: String(user.id),
        nickname,
        role: admin.status === 'creator' ? ('owner' as const) : ('admin' as const)
      }
    })
  }

  /**
   * 踢出群成员 (Ban / Kick)
   */
  public async kickGroupMember(groupId: string, userId: string) {
    if (!this.adapter.bot) throw new Error('Bot not started')
    return await this.adapter.bot.banChatMember(groupId, Number(userId))
  }

  /**
   * 解禁群成员 (Unban)
   */
  public async unbanGroupMember(groupId: string, userId: string) {
    if (!this.adapter.bot) throw new Error('Bot not started')
    return await this.adapter.bot.unbanChatMember(groupId, Number(userId))
  }

  /**
   * 设置群名
   */
  public async setGroupTitle(groupId: string, title: string) {
    if (!this.adapter.bot) throw new Error('Bot not started')
    return await this.adapter.bot.setChatTitle(groupId, title)
  }

  /**
   * 置顶消息
   */
  public async pinMessage(groupId: string, messageId: string | number) {
    if (!this.adapter.bot) throw new Error('Bot not started')
    return await this.adapter.bot.pinChatMessage(groupId, Number(messageId))
  }

  /**
   * 取消置顶消息
   */
  public async unpinMessage(groupId: string, messageId: string | number) {
    if (!this.adapter.bot) throw new Error('Bot not started')
    return await this.adapter.bot.unpinChatMessage(groupId, { message_id: Number(messageId) })
  }
}

export default TelegramApi
