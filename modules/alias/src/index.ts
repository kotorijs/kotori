/*
 * @Author: hotaru biyuehuya@gmail.com
 * @Blog: https://hotaru.icu
 * @Date: 2023-07-11 14:18:27
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2024-06-07 21:19:44
 */
import { Context, Symbols } from 'kotori-bot';

export const lang = [__dirname, '../locales'];

export const inject = ['file'];

type Data = Record<string, string>;

export function main(ctx: Context) {
  const load = (bot: string) => ctx.file.load<Data>(`${bot}.json`, 'json', {});
  const save = (bot: string, data: Data) => ctx.file.save(`${bot}.json`, data);

  ctx.midware((next, session) => {
    const s = session;
    const list = load(s.api.adapter.identity);
    if (list[s.message] || s.message.trim() in list) s.message = list[s.message];
    next();
  }, 90);

  ctx.command('alias query - alias.descr.alias.query').action((_, session) => {
    const list = Object.entries(load(session.api.adapter.identity) ?? {})
      .map((el) => session.format('alias.msg.alias.list', [...el]))
      .join('');
    return ['alias.msg.alias.query', [list]];
  });

  ctx.command('alias add <alias> <...command> - alias.descr.alias.add').action((data, session) => {
    const list = load(session.api.adapter.identity);
    if ((data.args[0] as string) in list) return 'alias.msg.alias.fail';
    let useful = false;
    ctx[Symbols.command].forEach((command) => {
      if (useful) return;
      if (command.meta.root === data.args[1] || command.meta.alias.includes(data.args[1] as string)) useful = true;
    });
    if (!useful) return 'alias.msg.alias.fail.2';
    list[data.args[0] as string] = data.args.slice(1).join(' ');
    save(session.api.adapter.identity, list);
    return ['alias.msg.alias.add', [data.args[0]]];
  });

  ctx.command('alias del <alias> - alias.descr.alias.del').action((data, session) => {
    const list = load(session.api.adapter.identity);
    if (!((data.args[0] as string) in list)) return session.error('no_exists', { target: data.args[0] as string });
    delete list[data.args[0] as string];
    save(session.api.adapter.identity, list);
    return ['alias.msg.alias.del', [data.args[0]]];
  });
}
