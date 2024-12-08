/*
 * @Author: Hotaru biyuehuya@gmail.com
 * @Blog: https://hotaru.icu
 * @Date: 2023-09-29 14:31:13
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2024-08-09 17:54:50
 */
import { Api, type Message, MessageSingle } from 'kotori-bot'
import type TelegramAdapter from './adapter'

export class TelegramApi extends Api {
  private async sendMedia(chatId: number, message: Message) {
    if (typeof message === 'string') return
    if (!(message instanceof MessageSingle)) {
      for await (const el of message) if (el.data.type !== 'text') await this.sendMedia(chatId, el)
      return
    }
    switch (message.data.type) {
      case 'image':
        await this.adapter.bot?.sendPhoto(chatId, message.data.content)
        break
      case 'audio':
        await this.adapter.bot?.sendAudio(chatId, message.data.content)
        break
      case 'video':
        await this.adapter.bot?.sendVideo(chatId, message.data.content)
        break
      case 'voice':
        await this.adapter.bot?.sendVoice(chatId, message.data.content)
        break
      case 'location':
        await this.adapter.bot?.sendLocation(chatId, message.data.latitude, message.data.longitude)
        break
    }
  }

  private async sendMsg(chatId: number, message: Message) {
    const decode = this.adapter.elements.decode(message)
    const result = decode.trim() ? await this.adapter.bot?.sendMessage(chatId, decode) : undefined
    await this.sendMedia(chatId, message)
    const messageId = result?.message_id.toString() ?? ''
    this.adapter.ctx.emit('send', { api: this, messageId })
    return { messageId, time: result?.date ?? 0 }
  }

  public readonly adapter: TelegramAdapter

  public constructor(adapter: TelegramAdapter) {
    super(adapter)
    this.adapter = adapter
  }

  public getSupportedEvents(): ReturnType<Api['getSupportedEvents']> {
    return ['on_message']
  }

  public async sendPrivateMsg(message: Message, userId: string) {
    return this.sendMsg(Number(userId), message)
  }

  public sendGroupMsg(message: Message, groupId: string) {
    return this.sendMsg(Number(groupId), message)
  }

  public sendChannelMsg(message: Message, guildId: string, channelId: string) {
    return this.sendMsg(Number(channelId ?? guildId), message)
  }
}

export default TelegramApi
