import { Context, ModuleConfig, Tsu, MessageScope } from 'kotori-bot';

/* 设置 i18n */
export const lang = [__dirname, '../locales']; // or: const lang = path.join(__dirname, '../locales');

/* 自定义插件配置 */
export const kotoriConfigSchema = Tsu.Object({
  config1: Tsu.Number().range(0, 10),
  config2: Tsu.Boolean(),
  config3: Tsu.Union([Tsu.Literal('on'), Tsu.Literal('off')])
});
export type Config = ModuleConfig & Tsu.infer<typeof kotoriConfigSchema>;

/* 设置依赖服务 */
export const inject = ['database'];

/* 插件入口 */
export function main(ctx: Context, config: Config) {
  ctx.on('ready', async () => {
    await ctx.db
      .createTable('test', (table) => {
        table.increments();
        table.string('name');
        table.timestamps();
      })
      .catch(() => {});
    await ctx.db.insert({ name: 'a' }).into('test');
  });

  /* 事件监听 */
  ctx.on('on_group_decrease', (session) => {
    session.quick([
      session.userId === session.operatorId ? '%target% 默默的退出了群聊' : '%target% 被 %operator% 制裁了...',
      {
        target: session.userId,
        operator: session.operatorId
      }
    ]);
  });

  /* 中间件注册 */
  ctx.midware((next, session) => {
    const s = session;
    if (s.message.startsWith('/说') || s.message.includes('/说')) {
      s.message = `${s.api.adapter.config['command-prefix']}echo`;
    }
    next();
  }, 10);

  /* 指令注册 */
  ctx
    .command('echo <content> [num:number=3]')
    .action((data, session) => {
      ctx.logger.debug(data, data.args[0]);
      ctx.logger.debug(session.message);
      return [`返回消息:~%message%`, { message: data.args[0] }];
    })
    .alias('print')
    .scope(MessageScope.GROUP);

  /* 正则注册 */
  ctx.regexp(/^(.*)#print$/, (match) => match[1]);
}
