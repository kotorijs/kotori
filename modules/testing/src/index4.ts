import { plugin, Tsu, ModuleConfig, EventsList, CommandAccess, CommandAction, Context, MessageScope } from 'kotori-bot';

const test = plugin({
  name: 'kotori-plugin-testing',
  kotori: {
    enforce: 'post',
    meta: {
      languages: ['en_US', 'ja_JP', 'zh_TW', 'zh_CN']
    }
  }
}); // or: const test = plugin(loadConfig(`${__dirname}/../package.json`));

const kotoriConfigSchema = Tsu.Object({
  config1: Tsu.Number().range(0, 10),
  config2: Tsu.Boolean(),
  config3: Tsu.Union([Tsu.Literal('on'), Tsu.Literal('off')])
});
type Config = ModuleConfig & Tsu.infer<typeof kotoriConfigSchema>;

/* 插件入口 */
@test.import({
  lang: [__dirname, '../locales'], // 设置 i18n
  config: kotoriConfigSchema, // 自定义插件配置
  inject: ['database'] // 设置全局的依赖服务
})
class Test {
  constructor(private Ctx: Context, private Config: Config) { };

  /* 事件监听 */
  @test.event({ type: 'group_decrease', inject: ['console'] /* 设置该方法特有的依赖服务 */ });
  groupDecrease(session: EventsList['group_decrease']) {
    session.quick([
      session.userId === session.operatorId ? '%target% 默默的退出了群聊' : '%target% 被 %target% 制裁了...',
      {
        target: session.userId,
        operator: session.operatorId
      }
    ]);
  }

  /* 中间件注册 */
  @test.midware(/* {priority: 10}  设置*/)
  midware(next: () => void, session: EventsList['midwares']) {
    const s = session;
    if (s.message.startsWith('说') || s.message.includes('说')) {
      s.message = `${s.api.adapter.config['command-prefix']}echo`;
    }
    next();
  };

  /* 指令注册 */
  @test.command({
    template: 'echo <content> [num:number=3]',
    scope: MessageScope.GROUP
    /* 可在此处传入额外配置也可以链式 */
  }).alias('print')
  echo(data: Parameters<CommandAction>[0], session: Parameters<CommandAction>[1]) {
    session.ctx.logger.debug(data, data.args[0]);
    session.ctx.logger.debug(session);
    return [`返回消息:~%message%`, { message: data.args[0] }];
  }

  /* 正则注册 */
  @test.regexp({ regexp: /^(.*)#print$/ })
  print(match: RegExpExecArray) {
    return match[1];
  };
}
