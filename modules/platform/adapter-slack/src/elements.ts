import { Elements, type Message, MessageSingle, type MessageMapping } from 'kotori-bot'

export class SlackElements extends Elements {
  public getSupportsElements(): (keyof MessageMapping)[] {
    return ['image', 'voice', 'video', 'text', 'audio']
  }

  public decode(message: Message): string {
    if (typeof message === 'string') return message
    if (!(message instanceof MessageSingle)) {
      return Array.from(message)
        .map((el) => this.decode(el))
        .join('')
    }

    if (message.data.type === 'text') return message.toString()
    if (!(['image', 'audio', 'video', 'voice'] as const).includes(message.data.type as 'image')) return ''
    return `![](${(message.data as { content: string }).content})`
  }

  public encode(raw: string): Message {
    return new MessageSingle('text', { text: raw })
  }
}

export default SlackElements
