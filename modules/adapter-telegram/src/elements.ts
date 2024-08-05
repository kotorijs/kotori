import { Elements, type Message, MessageSingle, type MessageMapping } from 'kotori-bot'

export class TelegramElements extends Elements {
  public getSupportsElements(): (keyof MessageMapping)[] {
    return ['image', 'voice', 'video', 'text', 'location']
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
      default:
        return ''
    }
  }

  public encode(raw: string): Message {
    return new MessageSingle('text', { text: raw })
  }
}

export default TelegramElements
