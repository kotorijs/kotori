import Kotori, { MessageScope } from 'kotori-bot';
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
Kotori.midware((next, session) => {
  const s = session;
  if (s.message.startsWith('说') || s.message.includes('说')) {
    s.message = `${s.api.adapter.config['command-prefix']}echo`;
  }
  next();
}, 10);

/* 指令注册 */
Kotori.command('echo <content> [num:number=3]')
  .action((data, session) => {
    Kotori.logger.debug(data, data.args[0]);
    Kotori.logger.debug(session.message);
    return [`返回消息:~%message%`, { message: data.args[0] }];
  })
  .alias('print')
  .scope(MessageScope.GROUP);

/* 正则注册 */
Kotori.regexp(/^(.*)#print$/, (match) => match[1]);
