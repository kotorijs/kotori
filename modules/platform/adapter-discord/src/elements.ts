import { Elements, type Message, type MessageMapping, MessageSingle } from 'kotori-bot'

export class DiscordElements extends Elements {
  public getSupportsElements(): (keyof MessageMapping)[] {
    return ['text']
  }

  public decode(message: Message): string {
    if (typeof message === 'string') return message
    return message.toString()
  }

  public encode(raw: string): Message {
    return new MessageSingle('text', { text: raw })
  }
}

export default DiscordElements
