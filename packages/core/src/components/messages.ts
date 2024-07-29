import type { Message, MessageMapping } from '../types'

/**
 * Single message class.
 *
 * @template T - Message type
 */
export class MessageSingle<T extends keyof MessageMapping> extends String {
  private data: MessageMapping[T]

  /**
   * Message type.
   *
   * @readonly
   */
  public readonly type: T

  /**
   * Message text length.
   *
   * @readonly
   */
  public readonly length: number

  /**
   * Create a single message
   *
   * @param type - Message type
   * @param data - Message data
   */
  public constructor(type: T, data: MessageMapping[T]) {
    super(Messages.stringify(type, data, false))
    this.type = type
    this.data = data
    this.length = this.isText() ? this.toString().length : 0
  }

  /**
   * Convert message to string.
   *
   * @param isStrict - Whether to strictly convert message, strict convert will ignore the elements else text
   * @returns Message string
   */
  public toString(isStrict = true) {
    return Messages.stringify(this.type, this.data, isStrict)
  }

  /**
   * Check whether the message is text.
   *
   * @returns Whether the message is text
   */
  public isText() {
    return this.type === 'text'
  }
}

class MessageListOrigin<T extends keyof MessageMapping> extends Array<MessageSingle<T>> {
  /**
   * Message list length.
   *
   * @readonly
   */
  public readonly length: number

  /**
   * Create a message list.
   *
   * @param messages - Message list
   */
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

  /**
   * Convert message list to string.
   *
   * @param isStrict - Whether to strictly convert message, strict convert will ignore the elements else text
   * @returns Message string
   */
  public toString(isStrict = true): string {
    return Array.from(this)
      .map((value) => value.toString(isStrict))
      .join('')
  }

  /**
   * Check whether the message list is pure.
   *
   * @param keys - Message type list
   *
   * @returns Whether the message list is pure
   */
  public isPure<T extends keyof MessageMapping>(...keys: T[]) {
    return this.every((value) => (keys as string[]).includes(value.type))
  }

  /**
   * Check whether the message list is text.
   *
   * @returns Whether the message list is text
   */
  public isText(): boolean {
    return this.isPure('text')
  }

  /**
   * Fetch all text from message list.
   *
   * @returns Text string
   */
  public fetchText() {
    return this.map((value) => (value.isText() ? value.toString() : ' ')).join('')
  }

  /**
   * Pick message list.
   *
   * @param keys - Message type list
   * @returns Message list
   */
  public pick<T extends keyof MessageMapping>(...keys: T[]): MessageList<T> {
    return Messages(...this.filter((value) => (keys as string[]).includes(value.type))) as unknown as MessageList<T>
  }

  /**
   * Omit message list.
   *
   * @param keys - Message type list
   * @returns Message list
   */
  public omit<T extends keyof MessageMapping>(...keys: T[]): MessageList<T> {
    return Messages(...this.filter((value) => !(keys as string[]).includes(value.type))) as unknown as MessageList<T>
  }
}

/**
 * Message list class.
 *
 * @template T - Message type
 * @class
 */
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
}) as unknown as new <T extends keyof MessageMapping = keyof MessageMapping>(
  ...args: ConstructorParameters<typeof MessageListOrigin>
) => MessageList<T>

/**
 * Create a message list.
 *
 * @param messages - Message list
 * @returns Message list
 */
export function Messages<T extends keyof MessageMapping = keyof MessageMapping>(...messages: Message<T>[]) {
  return new MessageList(...messages)
}

/**
 * Messages namespace
 *
 * @namespace
 */
export namespace Messages {
  /**
   * Create a text message.
   *
   * @param text - Text string
   * @returns Text message
   */
  export function text(text: string) {
    return new MessageSingle('text', { text })
  }

  /**
   * Create a mention message.
   *
   * @param userId - User id
   * @returns Mention message
   */
  export function mention(userId: string) {
    return new MessageSingle('mention', { userId })
  }

  /**
   * Create a mention all message.
   *
   * @returns Mention all message
   */
  export function mentionAll() {
    return new MessageSingle('mentionAll', {})
  }

  /**
   * Create an image message.
   *
   * @param content - Image content
   * @returns Image message
   */
  export function image(content: string) {
    return new MessageSingle('image', { content })
  }

  /**
   * Create a voice message.
   *
   * @param content - Voice content
   * @returns Voice message
   */
  export function voice(content: string) {
    return new MessageSingle('voice', { content })
  }

  /**
   * Create an audio message.
   *
   * @param content - Audio content
   * @returns Audio message
   */
  export function audio(content: string) {
    return new MessageSingle('audio', { content })
  }

  /**
   * Create a video message.
   *
   * @param content - Video content
   * @returns Video message
   */
  export function video(content: string) {
    return new MessageSingle('video', { content })
  }

  /**
   * Create a file message.
   *
   * @param content - File content
   * @returns File message
   */
  export function file(content: string) {
    return new MessageSingle('file', { content })
  }

  /**
   * Create a location message.
   *
   * @param latitude - Latitude
   * @param longitude - Longitude
   * @param title - Title
   * @param content - Content
   * @returns Location message
   */
  export function location(latitude: number, longitude: number, title: string, content: string) {
    return new MessageSingle('location', { latitude, longitude, title, content })
  }

  /**
   * Create a reply message.
   *
   * @param messageId - Message id
   * @returns Reply message
   */
  export function reply(messageId: string) {
    return new MessageSingle('reply', { messageId })
  }

  /**
   * Stringify message.
   *
   * @param type - Message type
   * @param data - Message data
   * @param isStrict - Whether to strictly convert message, strict convert will ignore the elements else text
   * @returns Message string
   */
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
