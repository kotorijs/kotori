import { Elements, MessageSingle, type Message, type MessageMapping } from 'kotori-bot'

export class McElements extends Elements {
  public getSupportsElements(): (keyof MessageMapping)[] {
    return ['text', 'mention', 'mentionAll']
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
        return `file=${message.data.content},cache=0`
      case 'video':
        return `Video: ${message.data.content}`
      case 'mention':
        return `@${message.data.userId}`
      case 'mentionAll':
        return '@a'
      case 'reply':
        return `Reply @${message.data.messageId}:`
      default:
        return ''
    }
  }

  public encode(raw: string): Message {
    return new MessageSingle('text', { text: raw })
  }
}

export default McElements
