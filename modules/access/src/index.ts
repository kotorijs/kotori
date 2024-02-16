import { CommandAccess, Context, MessageScope } from 'kotori-bot';

export const lang = [__dirname, '../locales'];

export const inject = ['file'];

type Data = Record<string, string[]>;

export function main(ctx: Context) {
  const load = (platform: string) => ctx.file.load(`${platform}.json`, 'json', {}) as Data;
  const save = (platform: string, data: Data) => ctx.file.save(`${platform}.json`, data);

  ctx.on('before_parse', (data) => {
    const d = data;
    if (d.session.type !== MessageScope.GROUP || !d.session.groupId) return;
    const list = load(d.session.api.adapter.platform);
    if (!(String(d.session.groupId) in list)) return;
    if (!list[String(d.session.groupId)].includes(String(d.session.userId))) return;
    d.session.sender.role = 'admin';
  });

  ctx
    .command('access query - access.descr.access.query')
    .action((_, session) => {
      const list = (load(session.api.adapter.platform)[String(session.groupId)] ?? [])
        .map((el) => session.format('access.msg.access.list', [el]))
        .join('');
      return ['access.msg.access.query', [list]];
    })
    .scope(MessageScope.GROUP)
    .access(CommandAccess.ADMIN);

  ctx
    .command('access add <userId> - access.descr.access.add')
    .action((data, session) => {
      const list = load(session.api.adapter.platform);
      const index = String(session.groupId);
      list[index] = list[index] ?? [];
      if (list[index].includes(data.args[0] as string)) {
        return session.error('exists', { target: data.args[0] as string });
      }
      list[index].push(data.args[0] as string);
      save(session.api.adapter.platform, list);
      return ['access.msg.access.add', [data.args[0]]];
    })
    .scope(MessageScope.GROUP)
    .access(CommandAccess.ADMIN);

  ctx
    .command('access del <userId> - access.descr.access.del')
    .action((data, session) => {
      const list = load(session.api.adapter.platform);
      const index = String(session.groupId);
      list[index] = list[index] ?? [];
      if (!list[index].includes(data.args[0] as string)) {
        return session.error('no_exists', { target: data.args[0] as string });
      }
      list[index] = list[index].filter((el) => el !== data.args[0]);
      save(session.api.adapter.platform, list);
      return ['access.msg.access.del', [data.args[0]]];
    })
    .scope(MessageScope.GROUP)
    .access(CommandAccess.ADMIN);
}
