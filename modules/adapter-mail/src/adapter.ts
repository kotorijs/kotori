import {
  type AdapterConfig,
  type Context,
  MessageScope,
  Tsu,
  KotoriError,
  Adapter,
  Symbols,
  formatFactory,
  sleep,
  type Api
} from 'kotori-bot'
import MailApi from './api'
import MailElements from './elements'
import * as nodemailer from 'nodemailer'
import * as imap from 'imap-simple'
import { simpleParser } from 'mailparser'

export const config = Tsu.Object({
  title: Tsu.String().domain().default('Love from kotori bot mailer').describe('Mail default title'),
  commandEnable: Tsu.Boolean()
    .default(true)
    .describe("Whether to enable command, other bot's master can send mail by the command, please set at top mail bot"),
  forward: Tsu.Array(Tsu.String())
    .default([])
    .describe("bots' identity, will forward to the bot's master on receiving mail, please set at top mail bot"),
  user: Tsu.String().describe('Email address'),
  interval: Tsu.Number().default(60).describe('Check mail interval (seconds)'),
  password: Tsu.String().describe('Email password'),
  imapHost: Tsu.String().describe('IMAP server host'),
  imapPort: Tsu.Number().describe('IMAP server port'),
  smtpHost: Tsu.String().describe('SMTP server host'),
  smtpPort: Tsu.Number().describe('SMTP server port')
})

type MailConfig = Tsu.infer<typeof config> & AdapterConfig

let isLoaded = false

export class MailAdapter extends Adapter<MailApi, MailConfig, MailElements> {
  private timerId?: NodeJS.Timeout

  public readonly config: MailConfig

  public readonly elements: MailElements = new MailElements(this)

  public readonly api: MailApi = new MailApi(this)

  public readonly platform = 'mail'

  public transporter: nodemailer.Transporter

  public imapConnection?: imap.ImapSimple

  public constructor(ctx: Context, config: MailConfig, identity: string) {
    super(ctx, config, identity)
    this.config = config
    this.transporter = nodemailer.createTransport({
      host: this.config.smtpHost,
      port: this.config.smtpPort,
      secure: false,
      auth: {
        user: this.config.user,
        pass: this.config.password
      }
    })
    // Loading plugin
    this.ctx.inject('db')
    if (isLoaded) return
    this.ctx.load({
      ...require('./plugin'),
      config: { forward: this.config.forward, enable: this.config.commandEnable }
    })
    isLoaded = true
  }

  public handle() {
    const apis: Api[] = []
    for (const bots of this.ctx[Symbols.bot].values()) apis.push(...bots)

    this.imapConnection?.openBox('INBOX').then(async () => {
      const fetchOptions = {
        bodies: ['HEADER', 'TEXT'],
        markSeen: false
      }

      const list = await this.ctx.db.get<number[]>('read', [])
      const results = ((await this.imapConnection?.search(['UNSEEN'], fetchOptions)) ?? []).filter(
        (item) => !list.includes(item.attributes.uid)
      )

      if (results.length === 0) return
      this.ctx.logger.record(/* html */ `<magenta>${results.length} new email(s) received</magenta>`)
      for await (const item of results) {
        const all = item.parts.filter((part) => part.which === 'TEXT')
        const id = item.attributes.uid
        list.push(id)

        const idHeader = `Imap-Id: ${id}\r\n`
        for await (const part of all) {
          const email = await simpleParser(idHeader + part.body)
          if (!email.text) continue

          for (const identity of this.config.forward) {
            const api = apis.find((api) => api.adapter.identity === identity)
            if (!api) {
              this.ctx.emit(
                'error',
                KotoriError.from(`Failed to forward mail, cant not find ${identity} bot`, this.ctx.identity?.toString())
              )
              continue
            }
            api.sendPrivateMsg(
              formatFactory(api.adapter.ctx.i18n)('adapter_mail.forward', [
                email.from?.text,
                email.subject,
                email.text,
                email.date ? api.adapter.ctx.i18n.date(email.date) : ''
              ]),
              api.adapter.config.master
            )
          }
          this.session('on_message', {
            type: MessageScope.PRIVATE,
            userId: email.from?.text ?? '',
            message: email.text ?? email.subject ?? '',
            messageAlt: email.text ?? email.subject ?? '',
            messageId: id.toString(),
            sender: {
              nickname: email.from?.text || ''
            },
            time: email.date?.getTime() || Date.now()
          })
        }
      }

      await this.ctx.db.put('read', list)
    })
  }

  public async start() {
    try {
      this.imapConnection = await imap.connect({
        imap: {
          user: this.config.user,
          password: this.config.password,
          host: this.config.imapHost,
          port: this.config.imapPort,
          tls: true
        }
      })
      this.ctx.emit('connect', {
        type: 'connect',
        mode: 'other',
        adapter: this,
        normal: true,
        address: `imap://${this.config.imapHost}:${this.config.imapPort}`
      })
      await sleep(10 * 1000)
      this.timerId = setInterval(() => this.handle(), this.config.interval * 1000)
    } catch (error) {
      this.ctx.emit('error', KotoriError.from(error, this.ctx.identity?.toString()))
    }
  }

  public stop() {
    this.imapConnection?.end()
    clearInterval(this.timerId)
    this.ctx.emit('connect', {
      type: 'disconnect',
      mode: 'other',
      adapter: this,
      normal: true,
      address: 'mail'
    })
  }

  public send() {}
}

export default MailAdapter
