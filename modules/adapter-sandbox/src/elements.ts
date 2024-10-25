import { Elements, MessageSingle, type MessageMapping, type Message } from 'kotori-bot'

export class SandboxElements extends Elements {
  public getSupportsElements(): (keyof MessageMapping)[] {
    return ['text', 'image', 'voice', 'video', 'location', 'mention', 'mentionAll', 'reply']
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
      case 'location':
        return `[location,${message.data.title},${message.data.content},${message.data.latitude},${message.data.longitude}]`
      case 'mention':
        return `[mention,${message.data.userId}]`
      case 'mentionAll':
        return '[all]'
      case 'reply':
        return `[reply,${message.data.messageId}]`
      case 'file':
        return `[file,${message.data.content}]`
      case 'audio':
        return `[audio,${message.data.content}]`
    }
  }

  public encode(raw: string): Message {
    return new MessageSingle('text', { text: raw })
  }
}

export default SandboxElements
