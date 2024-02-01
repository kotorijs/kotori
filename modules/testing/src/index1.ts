import Kotori, { CommandAccess } from 'kotori-bot';
import { join } from 'path';

/* 设置 i18n */
Kotori.i18n.use(join(__dirname, '../locales'));

/* 事件监听 */
Kotori.on('group_decrease', (session) => {
  session.quick([
    session.userId === session.operatorId ? '%target% 默默的退出了群聊' : '%target% 被 %target% 制裁了...',
    {
      target: session.userId,
      operator: session.operatorId
    }
  ]);
});

/* 中间件注册 */
ctx.midware((next, session) => {
  if (session.message.startWith === '说' || session.message.includes('说')) {
    session.message = `${session.api.adapter.config['command-prefix']}echo`;
  }
  next();
}, 10);

/* 指令注册 */
Kotori.command('echo <content> [num:number=3]')
  .action((data, session) => {
    Kotori.logger.debug(data, data.args[0]);
    Kotori.logger.debug(message);
    return [`返回消息:~%message%`, { message: data.args[0] }];
  })
  .alias('print')
  .scope(CommandAccess.GROUP);

/* 正则注册 */
Kotori.regexp(/^(.*)#print$/, (match) => match[1]);
