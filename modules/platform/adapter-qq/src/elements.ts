import { Elements, type Message, type MessageList, type MessageMapping, MessageSingle } from 'kotori-bot'
import { MEDIA_KEY } from './constants'
import { FileType } from './types'

export class QQElements extends Elements {
  public getSupportsElements(): (keyof MessageMapping)[] {
    return ['text', 'image', 'mention', 'video', 'voice']
  }

  public decode(message: Message, list?: MessageList<'text'>): string {
    if (typeof message === 'string') return message
    if (!(message instanceof MessageSingle)) {
      return Array.from(message)
        .map((el) => this.decode(el, message as MessageList<'text'>))
        .join('')
    }
    if (message.data.type === 'text') return message.toString()

    const mapping = {
      image: FileType.IMAGE,
      voice: FileType.VOICE,
      video: FileType.VIDEO
    }
    if (!Object.keys(mapping).includes(message.data.type)) return ''
    const meta = {
      type: mapping[message.data.type as 'image'],
      value: (message.data as unknown as { content: string }).content
    }
    if (!list) {
      Reflect.defineMetadata(MEDIA_KEY, [meta], message)
      return ''
    }
    Reflect.defineMetadata(MEDIA_KEY, [...((Reflect.getMetadata(MEDIA_KEY, list) as []) ?? []), meta], list)
    return ''
  }

  public encode(raw: string): Message {
    return new MessageSingle('text', { text: raw })
  }
}

export default QQElements
