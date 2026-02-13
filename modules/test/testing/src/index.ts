import { Tsu, type CommandAction, plugins, type Session, KotoriPlugin, UserAccess } from 'kotori-bot'

const plugin = plugins([__dirname, '../'])

@plugin.import
export class TestingPlugin extends KotoriPlugin<Tsu.infer<typeof TestingPlugin.schema>> {
  @plugin.schema
  public static schema = Tsu.Object({
    config1: Tsu.Number().range(0, 10).optional(),
    config2: Tsu.Boolean().optional(),
    config3: Tsu.Union(Tsu.Literal('on'), Tsu.Literal('off')).optional()
  })

  @plugin.on({ type: 'ready' })
  public async onReady() {}

  @plugin.command({ template: 'echo <...content>', access: UserAccess.ADMIN })
  public echo(data: Parameters<CommandAction>[0], session: Session) {
    this.ctx.logger.debug(data)
    this.ctx.logger.debug(session)
    return data.args.join(' ')
  }

  @plugin.command({ template: 'eval [...code]', access: UserAccess.ADMIN, options: [['I', 'interactive:boolean']] })
  public async eval({ args, options: { interactive } }: Parameters<CommandAction>[0], session: Session) {
    const run = async (code: string) => {
      try {
        // biome-ignore lint:
        const result = eval(code)
        session.json(result)
      } catch (error) {
        session.quick(['eval error:~\n{0}', [error instanceof Error ? error.message : String(error)]])
      }
    }

    if (!interactive) return run(args.join(' ').trim() || (await session.prompt('Input the code:')).toString())
    session.quick('Interactive mode enabled. Type `.exit` to exit.')
    while (true) {
      const code = (await session.prompt('Input the code:')).toString()
      if (code === '.exit') break
      await run(code)
    }
    session.quick('Interactive mode exited.')
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
