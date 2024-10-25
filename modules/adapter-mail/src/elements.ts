import { Elements, type Message, MessageSingle, type MessageMapping } from 'kotori-bot'

export class MailElements extends Elements {
  public getSupportsElements(): (keyof MessageMapping)[] {
    return ['text', 'image', 'voice', 'video', 'file', 'mention', 'reply']
  }

  public decode(message: Message): string {
    if (typeof message === 'string') return this.escapeHtml(message)
    if (!(message instanceof MessageSingle)) {
      return Array.from(message)
        .map((el) => this.decode(el))
        .join('')
    }
    switch (message.data.type) {
      case 'text':
        return this.escapeHtml(message.toString())
      case 'image':
        return `<img src="${this.escapeHtml(message.data.content)}" alt="Image" style="max-width:100%;">`
      case 'voice':
        return `<audio controls><source src="${this.escapeHtml(message.data.content)}" type="audio/mpeg">Your browser does not support the audio element.</audio>`
      case 'video':
        return `<video controls style="max-width:100%;"><source src="${this.escapeHtml(message.data.content)}" type="video/mp4">Your browser does not support the video tag.</video>`
      case 'file':
        return `<a href="${this.escapeHtml(message.data.content)}" target="_blank">Download File</a>`
      case 'mention':
        return `<span style="color:blue;">@${this.escapeHtml(message.data.userId)}</span>`
      case 'reply':
        return `<blockquote style="border-left: 2px solid #ccc; padding-left: 10px; margin-left: 0;">Reply to: ${this.escapeHtml(message.data.messageId)}</blockquote>`
      default:
        return `[${this.escapeHtml(message.data.type)},unsupported element]`
    }
  }

  public encode(raw: string): Message {
    return new MessageSingle('text', { text: raw })
  }

  private escapeHtml(unsafe: string): string {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }
}

export default MailElements
