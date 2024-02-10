import { Context } from 'kotori-bot';

export const lang = [__dirname, '../locales'];

export function main(ctx: Context) {
  ctx
    .command('sed <id>')
    .action(async (data, session) => {
      if (data.args[0] === session.api.adapter.selfId.toString())
        return ['querytool.msg.sed.fail', { input: data.args[0] }];

      const res = await ctx.http.get('https://api.sed', { msg: data.args[0] });
      if (!isObj(res)) return ['BOT_RESULT.SERVER_ERROR', { res }];
      if (res.code === 501 || !isObj(res.data)) return ['querytool.msg.sed.fail', { input: data.args[0] }];
      let list = '';
      list += res.data.qq
        ? stringTemp('querytool.msg.sed.list', {
            key: message.locale('querytool.msg.sed.key.qq'),
            content: res.data.qq
          })
        : '';
      list += res.data.phone
        ? stringTemp('querytool.msg.sed.list', {
            key: message.locale('querytool.msg.sed.key.phone'),
            content: res.data.phone
          })
        : '';
      list += res.data.location
        ? stringTemp('querytool.msg.sed.list', {
            key: message.locale('querytool.msg.sed.key.location'),
            content: res.data.location
          })
        : '';
      list += res.data.id
        ? stringTemp('querytool.msg.sed.list', {
            key: message.locale('querytool.msg.sed.key.id'),
            content: res.data.id
          })
        : '';
      list += res.data.area
        ? stringTemp('querytool.msg.sed.list', {
            key: message.locale('querytool.msg.sed.key.area'),
            content: res.data.area
          })
        : '';
      return [
        'querytool.msg.sed',
        {
          input: data.args[0],
          time: Math.floor(res.takeTime),
          count: res.count,
          list
        }
      ];
    })
    .help('querytool.descr.sed');
}
