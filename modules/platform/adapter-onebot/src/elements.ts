import { Elements, type Message, type MessageMapping, MessageSingle, Messages } from 'kotori-bot'
import type { MessageCqType } from './types'

export const escapeCq = (str: string, isInsideCq = false) =>
  str
    .replace(/&/g, '&amp;')
    .replace(/\[/g, '&#91;')
    .replace(/\]/g, '&#93;')
    .replace(isInsideCq ? /,/g : /(?!)/, '&#44;')

export const unescapeCq = (str: string) => str.replace(/&#44;/g, ',').replace(/&#91;/g, '[').replace(/&#93;/g, ']').replace(/&amp;/g, '&')

export class OnebotElements extends Elements {
  public getSupportsElements(): (keyof MessageMapping)[] {
    return ['mention', 'mentionAll', 'image', 'voice', 'audio', 'video', 'text', 'reply']
  }

  public decode(message: Message): string {
    if (typeof message === 'string') return escapeCq(message)
    if (!(message instanceof MessageSingle))
      return Array.from(message)
        .map((el) => this.decode(el))
        .join('')
    switch (message.data.type) {
      case 'text':
        return escapeCq(message.data.text ?? message.toString())
      case 'image':
        return this.cq('image', `file=${escapeCq(message.data.content, true)},cache=0`)
      case 'voice':
      case 'audio':
        return this.cq('record', `file=${escapeCq(message.data.content, true)}`)
      case 'video':
        return this.cq('video', `file=${escapeCq(message.data.content, true)}`)
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
    const segments: Message[] = []
    let lastIndex = 0
    const cqRegex = /\[CQ:([a-zA-Z0-9_-]+)((?:,[a-zA-Z0-9_-]+=[^,\]]*)*)\]/g
    let match: RegExpExecArray | null = cqRegex.exec(raw)

    while (match) {
      if (match.index > lastIndex) segments.push(new MessageSingle('text', { text: unescapeCq(raw.slice(lastIndex, match.index)) }))
      const type = match[1]
      const params = Object.fromEntries(
        match[2]
          .slice(1)
          .split(',')
          .filter(Boolean)
          .map((pair) => {
            const eqIndex = pair.indexOf('=')
            return eqIndex === -1 ? [pair, ''] : [pair.slice(0, eqIndex), unescapeCq(pair.slice(eqIndex + 1))]
          })
      )
      switch (type) {
        case 'at':
          segments.push(params.qq === 'all' ? new MessageSingle('mentionAll', {}) : new MessageSingle('mention', { userId: params.qq }))
          break
        case 'image':
          segments.push(new MessageSingle('image', { content: params.url ?? params.file }))
          break
        case 'record':
          segments.push(new MessageSingle('voice', { content: params.url ?? params.file }))
          break
        case 'video':
          segments.push(new MessageSingle('video', { content: params.url ?? params.file }))
          break
        case 'reply':
          segments.push(new MessageSingle('reply', { messageId: params.id }))
          break
        default:
          segments.push(new MessageSingle('text', { text: match[0] }))
      }
      lastIndex = match.index + match[0].length
      match = cqRegex.exec(raw)
    }
    if (lastIndex < raw.length) segments.push(new MessageSingle('text', { text: unescapeCq(raw.slice(lastIndex)) }))
    return segments.length === 1 ? segments[0] : Messages(...segments)
  }

  public cq(type: MessageCqType, data: string) {
    return `[CQ:${type},${data}]`
  }
}

export default OnebotElements
