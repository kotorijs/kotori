import { UserAccess, type Context, Symbols, Tsu } from 'kotori-bot'
import type MailAdapter from '../adapter'
import pkg from '../../package.json'
import { resolve } from 'node:path'

export const name = pkg.name

export function main(ctx: Context, config: { forward: string[]; enable: boolean }) {
  // const filter = new Filter({test: FilterTestList.PLATFORM, operator: '==', value: 'mail'})

  // ctx.midware((next, session) => {
  //   if (!filter.test(session)) {
  //     next()
  //     return
  //   }

  //   next()
  // })
  ctx.i18n.use(resolve(__dirname, '../../locales'))

  if (!config.enable) return
  ctx
    .command('mail <email> - adapter_mail.descr.mail')
    .access(UserAccess.ADMIN)
    .option('L', 'list:boolean adapter_mail.option.mail.list')
    .action(async ({ args: [email], options: { list } }, session) => {
      const instances = Array.from(ctx[Symbols.bot].get('mail') ?? []).map((bot) => bot.adapter as MailAdapter)
      if (list) {
        return session.format('adapter_mail.msg.mail.list', [
          instances
            .map((instance) => session.format('adapter_mail.msg.mail.item', [instance.identity, instance.config.user]))
            .join('')
        ])
      }

      const instance = instances.find((instance) => instance.config.user === email)
      if (!instance) return session.format('adapter_mail.msg.mail.fail.2', [email])

      const target = await session.prompt(ctx.i18n.t`adapter_mail.msg.mail.input_target`)
      if (!Tsu.String().email().check(target)) return 'adapter_mail.msg.mail.fail.3'
      const title = await session.prompt(ctx.i18n.t`adapter_mail.msg.mail.input_title`)
      const content = await session.prompt(ctx.i18n.t`adapter_mail.msg.mail.input_content`)
      const isSure = await session.confirm({
        message: session.format('adapter_mail.msg.mail.sure', [title, content, target]),
        sure: '1'
      })
      if (!isSure) return 'adapter_mail.msg.mail.cancel'

      try {
        const decodedMessage = instance.elements.decode(content)
        const info = await instance.transporter.sendMail({
          from: instance.config.user,
          to: target,
          subject: title.toString() ?? instance.config.title,
          html: /* html */ `
          <html>
            <body>
              ${decodedMessage}
            </body>
          </html>
        `,
          text: instance.api.stripHtml(decodedMessage)
        })
        instance.ctx.emit('send', { api: instance.api, messageId: info.messageId })
        return session.format('adapter_mail.msg.mail.success', [target])
      } catch (e) {
        return session.format('adapter_mail.msg.mail.fail.2', [String(e)])
      }
    })
}
