import { Api, type Message } from 'kotori-bot'
import type { MailAdapter } from './adapter'

export class MailApi extends Api {
  public stripHtml(html: string): string {
    return html.replace(/<[^>]*>?/gm, '')
  }

  public readonly adapter: MailAdapter

  public constructor(adapter: MailAdapter) {
    super(adapter)
    this.adapter = adapter
  }

  public getSupportedEvents(): ReturnType<Api['getSupportedEvents']> {
    return ['on_message']
  }

  public async sendPrivateMsg(message: Message, userId: string) {
    const decodedMessage = this.adapter.elements.decode(message)
    const info = await this.adapter.transporter.sendMail({
      from: this.adapter.config.user,
      to: userId,
      subject: this.adapter.config.title,
      html: /* html */ `
      <html>
        <body>
          ${decodedMessage}
        </body>
      </html>
    `,
      text: this.stripHtml(decodedMessage)
    })
    this.adapter.ctx.emit('send', { api: this, messageId: info.messageId })
    return { messageId: info.messageId, time: Date.now() }
  }
}

export default MailApi
