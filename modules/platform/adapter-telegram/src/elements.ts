import { Elements, type Message, type MessageMapping, MessageSingle, Messages } from 'kotori-bot'
import type { Message as TgMessage } from 'node-telegram-bot-api'

export class TelegramElements extends Elements {
  public getSupportsElements(): (keyof MessageMapping)[] {
    return ['text', 'mention', 'mentionAll', 'image', 'voice', 'audio', 'video', 'file', 'location', 'reply']
  }

  public decode(message: Message): string {
    if (typeof message === 'string') return message
    if (!(message instanceof MessageSingle)) {
      return Array.from(message)
        .map((el) => this.decode(el))
        .join('')
    }
    switch (message.data.type) {
      case 'text':
        return message.data.text ?? message.toString()
      case 'mention':
        return message.data.userId.startsWith('@') ? message.data.userId : `@${message.data.userId}`
      case 'mentionAll':
        return '@everyone'
      case 'reply':
        return ''
      default:
        return ''
    }
  }

  public encode(raw: string): Message {
    return new MessageSingle('text', { text: raw })
  }

  /**
   * 将 Telegram Message 对象转换为 Kotori 的 Message 对象
   */
  public parseTelegramMessage(msg: TgMessage): { message: Message; messageAlt: string } {
    const segments: Message[] = []
    let altText = ''

    // 1. 回复 (Reply)
    if (msg.reply_to_message) {
      segments.push(new MessageSingle('reply', { messageId: String(msg.reply_to_message.message_id) }))
    }

    // 2. 文本 (Text / Caption)
    const textContent = msg.text ?? msg.caption ?? ''
    if (textContent) {
      altText += textContent
      segments.push(new MessageSingle('text', { text: textContent }))
    }

    // 3. 图片 (Photo) - 取最高分辨率的那张
    if (msg.photo && msg.photo.length > 0) {
      const bestPhoto = msg.photo[msg.photo.length - 1]
      segments.push(new MessageSingle('image', { content: bestPhoto.file_id }))
      if (!altText) altText = '[图片]'
    }

    // 4. 音频 (Audio)
    if (msg.audio) {
      segments.push(new MessageSingle('audio', { content: msg.audio.file_id }))
      if (!altText) altText = '[音频]'
    }

    // 5. 语音 (Voice)
    if (msg.voice) {
      segments.push(new MessageSingle('voice', { content: msg.voice.file_id }))
      if (!altText) altText = '[语音]'
    }

    // 6. 视频 (Video)
    if (msg.video) {
      segments.push(new MessageSingle('video', { content: msg.video.file_id }))
      if (!altText) altText = '[视频]'
    }

    // 7. 文件 (Document / Animation / Sticker)
    if (msg.document) {
      segments.push(new MessageSingle('file', { content: msg.document.file_id }))
      if (!altText) altText = `[文件: ${msg.document.file_name ?? 'file'}]`
    } else if (msg.animation) {
      segments.push(new MessageSingle('video', { content: msg.animation.file_id }))
      if (!altText) altText = '[动图]'
    } else if (msg.sticker) {
      segments.push(new MessageSingle('image', { content: msg.sticker.file_id }))
      if (!altText) altText = '[贴纸]'
    }

    // 8. 位置 (Location)
    if (msg.location) {
      segments.push(
        new MessageSingle('location', {
          latitude: msg.location.latitude,
          longitude: msg.location.longitude,
          title: 'Location',
          content: `${msg.location.latitude},${msg.location.longitude}`
        })
      )
      if (!altText) altText = '[位置]'
    }

    const message = segments.length === 0 ? '' : segments.length === 1 ? segments[0] : Messages(...segments)
    return { message, messageAlt: altText }
  }
}

export default TelegramElements
