import type { Message, MessageMapping } from '../types'

export class MessageSingle<T extends keyof MessageMapping> extends String {
  private data: MessageMapping[T]

  public type: T

  public length: number

  public constructor(type: T, data: MessageMapping[T]) {
    super(Messages.stringify(type, data, false))
    this.type = type
    this.data = data
    this.length = this.isText() ? this.toString().length : 0
  }

  public toString(isStrict = true) {
    return Messages.stringify(this.type, this.data, isStrict)
  }

  public isText() {
    return this.type === 'text'
  }
}

class MessageListOrigin<T extends keyof MessageMapping> extends Array<MessageSingle<T>> {
  public length: number

  public constructor(...messages: Message<T>[]) {
    const handleMessage: MessageSingle<T>[] = []
    for (const value of messages) {
      if (typeof value === 'string') handleMessage.push(Messages.text(value) as MessageSingle<T>)
      else handleMessage.push(...((value instanceof MessageListOrigin ? [...value] : [value]) as MessageSingle<T>[]))
    }
    super(...handleMessage)
    Object.setPrototypeOf(this, MessageList.prototype)
    this.length = this.toString().length
  }

  public toString(): string {
    return Array.from(this)
      .map((value) => value.toString())
      .join('')
  }

  public isPure<T extends keyof MessageMapping>(...keys: T[]) {
    return this.every((value) => (keys as string[]).includes(value.type))
  }

  public isText(): boolean {
    return this.isPure('text')
  }

  public fetchText() {
    return this.map((value) => (value.isText() ? value.toString() : ' ')).join('')
  }

  public pick<T extends keyof MessageMapping>(...keys: T[]): MessageList<T> {
    return Messages(...this.filter((value) => (keys as string[]).includes(value.type))) as unknown as MessageList<T>
  }

  public omit<T extends keyof MessageMapping>(...keys: T[]): MessageList<T> {
    return Messages(...this.filter((value) => !(keys as string[]).includes(value.type))) as unknown as MessageList<T>
  }
}

export type MessageList<T extends keyof MessageMapping> = string & MessageListOrigin<T>
export const MessageList = new Proxy(MessageListOrigin, {
  construct: (target, argArray, newTarget) =>
    new Proxy(Reflect.construct(target, argArray, newTarget), {
      get: (target, prop, receiver) => {
        if (prop in target) return Reflect.get(target, prop, receiver)
        const func = String.prototype[target as keyof (typeof String)['prototype']]
        if (func instanceof Function) (func as () => void).bind(this)
        return undefined
      }
    })
}) as new (
  ...args: ConstructorParameters<typeof MessageListOrigin>
) => MessageList<keyof MessageMapping>

export function Messages<T extends keyof MessageMapping = keyof MessageMapping>(...messages: Message<T>[]) {
  return new MessageList(...messages)
}

export namespace Messages {
  export function text(text: string) {
    return new MessageSingle('text', { text })
  }

  export function mention(userId: string) {
    return new MessageSingle('mention', { userId })
  }

  export function mentionAll() {
    return new MessageSingle('mentionAll', {})
  }

  export function image(content: string) {
    return new MessageSingle('image', { content })
  }

  export function voice(content: string) {
    return new MessageSingle('voice', { content })
  }

  export function audio(content: string) {
    return new MessageSingle('audio', { content })
  }

  export function video(content: string) {
    return new MessageSingle('video', { content })
  }

  export function file(content: string) {
    return new MessageSingle('file', { content })
  }

  export function location(latitude: number, longitude: number, title: string, content: string) {
    return new MessageSingle('location', { latitude, longitude, title, content })
  }

  export function reply(messageId: string) {
    return new MessageSingle('reply', { messageId })
  }

  export function stringify<T extends keyof MessageMapping>(type: T, data: MessageMapping[T], isStrict = true) {
    if (isStrict) {
      if (type === 'text') return (data as MessageMapping['text']).text
      return ''
    }
    switch (type) {
      case 'text':
        return (data as MessageMapping['text']).text
      case 'mention':
        return `@${(data as MessageMapping['mention']).userId}`
      case 'mentionAll':
        return '@all'
      case 'location':
        return '[Location]'
      default:
        return `[${type.charAt(0).toUpperCase()}${type.slice(1)}]`
    }
  }
}

export default Messages
