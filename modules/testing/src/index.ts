import { Tsu, CommandAction, MessageScope, plugins, SessionData, KotoriPlugin } from 'kotori-bot';

const plugin = plugins([__dirname, '../']);

@plugin.import
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
class TestingPlugin extends KotoriPlugin<Tsu.infer<typeof TestingPlugin.schema>> {
  @plugin.lang
  public static lang = [__dirname, '../locales'];

  @plugin.schema
  public static schema = Tsu.Object({
    config1: Tsu.Number().range(0, 10).optional(),
    config2: Tsu.Boolean().optional(),
    config3: Tsu.Union([Tsu.Literal('on'), Tsu.Literal('off')]).optional()
  });

  @plugin.inject
  public static inject = ['database'];

  @plugin.on({ type: 'on_group_decrease' })
  public static groupDecrease(session: SessionData) {
    session.quick([
      session.userId === session.operatorId ? '%target% 默默的退出了群聊' : '%target% 被 %target% 制裁了...',
      {
        target: session.userId,
        operator: session.operatorId!
      }
    ]);
  }

  @plugin.midware({ priority: 10 })
  public static midware(next: () => void, session: SessionData) {
    const s = session;
    if (s.message.startsWith('说')) {
      s.message = `${s.api.adapter.config['command-prefix']}echo ${s.message.split('说 ')[1]}`;
    }
    next();
  }

  @plugin.command({
    template: 'echo <content> [num:number=3]',
    scope: MessageScope.GROUP
  })
  public echo(data: Parameters<CommandAction>[0], session: SessionData) {
    this.ctx.logger.debug(data, data.args[0]);
    this.ctx.logger.debug(session);
    return [`返回消息:~%message%`, { message: data.args[0] }];
  }

  @plugin.regexp({ match: /^(.*)#print$/ })
  public static print(match: RegExpExecArray) {
    return match[1];
  }

  // @plugin.task({ cron: '0/10 * * * * *' })
  public task() {
    this.ctx.logger.info('task run!');
  }
}
