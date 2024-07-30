import '../types'
import { UserAccess, type Context, MessageScope, formatFactory } from 'kotori-bot'

export default (ctx: Context) => {
  ctx.on('status', ({ status, adapter }) => {
    if (status !== 'online') return
    if (adapter.platform !== 'cmd') return
    if (ctx.webui.getVerifySalt()) return
    adapter.api.sendPrivateMsg(
      formatFactory(adapter.ctx.i18n)('webui.msg.webui.uninitialized', [adapter.config['command-prefix']]),
      adapter.config.master
    )
  })

  ctx
    .command('webui - webui.descr.webui')
    .scope(MessageScope.PRIVATE)
    .access(UserAccess.ADMIN)
    .option('R', 'reset:boolean - webui.option.webui')
    .action(async ({ options: { reset } }, session) => {
      if (reset) {
        ctx.file.save('salt', '')
        return 'webui.msg.webui.reset'
      }
      if (session.api.adapter.platform !== 'cmd') return 'webui.msg.webui.error'
      if (!ctx.webui.getVerifySalt()) {
        ctx.webui.setVerifyHash(
          (await session.prompt('webui.msg.webui.prompt.user')).toString(),
          (await session.prompt('webui.msg.webui.prompt.pwd')).toString()
        )
        return 'webui.msg.webui.success'
      }
      return session.format('webui.msg.webui', [ctx.config.global.port])
    })
}
