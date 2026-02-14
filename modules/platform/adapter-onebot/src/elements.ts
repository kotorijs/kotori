import { Elements, type Message, type MessageMapping, MessageSingle } from 'kotori-bot'
import type { MessageCqType } from './types'

export class OnebotElements extends Elements {
  public getSupportsElements(): (keyof MessageMapping)[] {
    return ['mention', 'mentionAll', 'image', 'voice', 'video', 'text', 'reply']
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
        return message.toString()
      case 'image':
        return this.cq('image', `file=${message.data.content},cache=0`)
      case 'voice':
        return this.cq('record', `file=${message.data.content}`)
      case 'video':
        return this.cq('video', `file=${message.data.content}`)
      case 'mention':
        return this.cq('at', `qq=${message.data.userId}`)
      case 'mentionAll':
        return this.cq('at', 'qq=all')
      case 'reply':
        return this.cq('reply', `id=${message.data.messageId}`)
      default:
        return ''
    }
  }

  public encode(raw: string): Message {
    return new MessageSingle('text', { text: raw })
  }

  public cq(type: MessageCqType, data: string) {
    return `[CQ:${type},${data}]`
  }
}

export default OnebotElements
