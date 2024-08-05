import { Elements, type Message, type MessageMapping, MessageSingle } from 'kotori-bot'

export class CmdElements extends Elements {
  public getSupportsElements(): (keyof MessageMapping)[] {
    return ['mention', 'mentionAll', 'text']
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
        return `[image,${message.data.content}]`
      case 'voice':
        return `[voice,${message.data.content}]`
      case 'video':
        return `[video,${message.data.content}]`
      case 'file':
        return `[file,${message.data.content}]`
      case 'location':
        return `[location,${message.data.content}]`
      case 'mention':
        return `@${message.data.userId}`
      case 'mentionAll':
        return '@all'
      case 'reply':
        return `[reply,${message.data.messageId}]`
      default:
        return `[${message.data.type},unsupported element]`
    }
  }

  public encode(raw: string): Message {
    return new MessageSingle('text', { text: raw })
  }
}

export default CmdElements
