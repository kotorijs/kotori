import { Elements, type Message, type MessageList, type MessageMapping, MessageSingle, Messages } from 'kotori-bot'
import { MEDIA_KEY, REPLY_KEY } from './constants'
import { FileType, type MessageAttachment, type MessageReference } from './types'

export class QQElements extends Elements {
  public getSupportsElements(): (keyof MessageMapping)[] {
    return ['text', 'image', 'mention', 'mentionAll', 'voice', 'audio', 'video', 'file', 'reply']
  }

  public decode(message: Message, list?: MessageList<'text'>): string {
    if (typeof message === 'string') return message
    if (!(message instanceof MessageSingle)) {
      return Array.from(message)
        .map((el) => this.decode(el, message as MessageList<'text'>))
        .join('')
    }
    if (message.data.type === 'text') {
      return (message.data as { text?: string }).text ?? message.toString()
    }

    if (message.data.type === 'mention') {
      return `<@${(message.data as { userId: string }).userId}>`
    }

    if (message.data.type === 'mentionAll') {
      return '@everyone'
    }

    if (message.data.type === 'reply') {
      const replyId = (message.data as { messageId: string }).messageId
      const target = list ?? message
      Reflect.defineMetadata(REPLY_KEY, replyId, target)
      return ''
    }

    const mapping: Record<string, FileType> = {
      image: FileType.IMAGE,
      voice: FileType.VOICE,
      audio: FileType.VOICE,
      video: FileType.VIDEO,
      file: FileType.FILE
    }
    const fileType = mapping[message.data.type]
    if (!fileType) return ''

    const meta = {
      type: fileType,
      value: (message.data as unknown as { content: string }).content
    }
    const target = list ?? message
    const existing = (Reflect.getMetadata(MEDIA_KEY, target) as (typeof meta)[]) ?? []
    Reflect.defineMetadata(MEDIA_KEY, [...existing, meta], target)
    return ''
  }

  public encode(raw: string): Message {
    return new MessageSingle('text', { text: raw })
  }

  public parseQQMessage(d: { content?: string; attachments?: MessageAttachment[]; message_reference?: MessageReference }): {
    message: Message
    messageAlt: string
  } {
    const segments: Message[] = []
    let altText = ''

    // 1. Reply
    if (d.message_reference?.message_id) {
      segments.push(new MessageSingle('reply', { messageId: d.message_reference.message_id }))
    }

    // 2. Text (strip leading/embedded <@!...> or <@...>)
    const rawContent = (d.content ?? '').replace(/<@!?\w+>/g, '').trim()
    if (rawContent) {
      altText += rawContent
      segments.push(new MessageSingle('text', { text: rawContent }))
    }

    // 3. Attachments
    if (d.attachments && Array.isArray(d.attachments)) {
      for (const att of d.attachments) {
        let url = att.url ?? ''
        if (url.startsWith('//')) {
          url = `https:${url}`
        }
        if (!url) continue

        const contentType = att.content_type?.toLowerCase() ?? ''
        const filename = att.filename?.toLowerCase() ?? ''

        if (contentType.startsWith('image/') || /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(filename)) {
          segments.push(new MessageSingle('image', { content: url }))
          altText += altText ? ' [图片]' : '[图片]'
        } else if (contentType.startsWith('audio/') || /\.(mp3|wav|ogg|silk|amr|aac|m4a|flac)$/i.test(filename)) {
          segments.push(new MessageSingle('voice', { content: url }))
          altText += altText ? ' [语音]' : '[语音]'
        } else if (contentType.startsWith('video/') || /\.(mp4|avi|mov|mkv|flv|webm)$/i.test(filename)) {
          segments.push(new MessageSingle('video', { content: url }))
          altText += altText ? ' [视频]' : '[视频]'
        } else {
          segments.push(new MessageSingle('file', { content: url }))
          const name = att.filename ? `: ${att.filename}` : ''
          altText += altText ? ` [文件${name}]` : `[文件${name}]`
        }
      }
    }

    const message = segments.length === 0 ? '' : segments.length === 1 ? segments[0] : Messages(...segments)
    return { message, messageAlt: altText || rawContent }
  }
}

export default QQElements
