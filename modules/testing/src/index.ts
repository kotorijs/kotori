import { Tsu, type CommandAction, plugins, type Session, KotoriPlugin, type SessionMsg, UserAccess } from 'kotori-bot'

const plugin = plugins([__dirname, '../'])

@plugin.import
export class TestingPlugin extends KotoriPlugin<Tsu.infer<typeof TestingPlugin.schema>> {
  @plugin.schema
  public static schema = Tsu.Object({
    config1: Tsu.Number().range(0, 10).optional(),
    config2: Tsu.Boolean().optional(),
    config3: Tsu.Union(Tsu.Literal('on'), Tsu.Literal('off')).optional()
  })

  @plugin.inject
  public static inject = ['database']

  @plugin.on({ type: 'ready' })
  public onReady() {
    this.ctx.logger.debug('database:', this.ctx.db)
  }

  @plugin.midware({ priority: 1 })
  public static midware(next: () => void, session: SessionMsg) {
    const s = session
    if (s.message.startsWith('说')) {
      s.message = `${s.api.adapter.config.commandPrefix}echo ${s.message.split('说 ')[1]}`
    }
    // s.send('<red>hhaha, I rejected all message event, you cant continue running!</rea>')
    next()
  }

  @plugin.command({ template: 'echo <...content>' })
  public echo(data: Parameters<CommandAction>[0], session: Session) {
    this.ctx.logger.debug(data)
    this.ctx.logger.debug(session)
    return data.args.join(' ')
  }

  @plugin.command({ template: 'eval <...code>', access: UserAccess.ADMIN })
  public eval({ args }: Parameters<CommandAction>[0], session: Session) {
    try {
      // biome-ignore lint:
      const result = eval(args.join(' '))
      return session.format('eval result:~\n{0}', [result])
    } catch (error) {
      return session.format('eval error:~\n{0}', [error instanceof Error ? error.message : String(error)])
    }
  }

  @plugin.regexp({ match: /^(.*)#print$/ })
  public static print(match: RegExpExecArray) {
    return match[1]
  }

  // @plugin.task({ cron: '0/10 * * * * *' })
  public task() {
    this.ctx.logger.info('task run!')
  }
}
