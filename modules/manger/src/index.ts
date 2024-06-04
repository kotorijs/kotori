import { CommandAccess, Context, MessageScope, Tsu } from 'kotori-bot';

export const lang = [__dirname, '../locales'];

export const inject = ['file'];

export const config = Tsu.Object({
  exitGroupAddBlack: Tsu.Boolean().default(true),
  exitGroupAddBlackTips: Tsu.Boolean().default(false),
  blackJoinGroupTips: Tsu.Boolean().default(true),
  banTime: Tsu.Number().default(10)
});

export function main(ctx: Context, con: Tsu.infer<typeof config>) {
  const loadBlack = (platform: string, target: string = 'global') =>
    ctx.file.load(`${platform}_${target}`, 'json', {}) as string[];
  const saveBlack = (platform: string, data: string[], target: string = 'global') =>
    ctx.file.save(`${platform}_${target}`, data);

  ctx.midware((next, session) => {
    const blackGlobal = loadBlack(session.api.adapter.platform);
    if (blackGlobal.includes(String(session.userId))) return;
    const black = session.groupId ? loadBlack(session.api.adapter.platform, String(session.groupId)) : [];
    if (black.includes(String(session.userId))) return;
    next();
  }, 80);

  ctx
    .command(`ban [userId] [time:number] - manger.descr.ban`)
    .action((data, session) => {
      const target = data.args[0] as string;
      const time = ((data.args[1] ?? con.banTime) as number) * 60;
      if (target) {
        session.api.setGroupBan(session.groupId!, target, time);
        return ['manger.msg.ban.user', [target, time / 60]];
      }
      session.api.setGroupBan(session.groupId!, undefined, 1);
      return 'manger.msg.ban.all';
    })
    .scope(MessageScope.GROUP)
    .access(CommandAccess.MANGER);

  ctx
    .command(`unban [userId] - manger.descr.unban`)
    .action((data, session) => {
      const target = data.args[0] as string;
      if (target) {
        session.api.setGroupBan(session.groupId!, target, 0);
        return ['manger.msg.unban.user', [target]];
      }
      session.api.setGroupBan(session.groupId!, undefined, 0);
      return 'manger.msg.ban.all';
    })
    .scope(MessageScope.GROUP)
    .access(CommandAccess.MANGER);

  ctx
    .command('kick <userId> - manger.descr.kick')
    .action((data, session) => {
      const target = data.args[0] as string;
      session.api.setGroupKick(session.groupId!, target);
      return ['manger.msg.kick', [target]];
    })
    .scope(MessageScope.GROUP)
    .access(CommandAccess.MANGER);

  ctx
    .command('all <...message> - manger.descr.all')
    .action((data, session) => `${session.el.at('all')}\n${data.args.join(' ')}`)
    .scope(MessageScope.GROUP)
    .access(CommandAccess.MANGER);

  ctx
    .command('notice <...message> - manger.descr.notice')
    .action((data, session) => {
      session.api.sendGroupNotice(session.groupId!, data.args.join(' ') as string);
    })
    .scope(MessageScope.GROUP)
    .access(CommandAccess.MANGER);

  ctx
    .command('black query - manger.descr.black.query')
    .option('g', 'global:boolean - manger.option.black.global')
    .scope(MessageScope.GROUP)
    .access(CommandAccess.MANGER)
    .action((data, session) => {
      const isGlobal = data.options.global;
      if (isGlobal && session.userId !== session.api.adapter.config.master) return session.error('no_access_admin');
      const list = loadBlack(session.api.adapter.platform, isGlobal ? undefined : String(session.groupId));
      return [
        `manger.msg.black${isGlobal ? 'g' : ''}.query`,
        [list.map((el) => session.format('manger.msg.black.list', [el])).join('')]
      ];
    });

  ctx
    .command('black add <userId> - manger.descr.black.add')
    .option('g', 'global:boolean - manger.option.black.global')
    .scope(MessageScope.GROUP)
    .access(CommandAccess.MANGER)
    .action((data, session) => {
      const target = data.args[0] as string;
      const isGlobal = data.options.global;
      if (isGlobal && session.userId !== session.api.adapter.config.master) return session.error('no_access_admin');
      const list = loadBlack(session.api.adapter.platform, isGlobal ? undefined : String(session.groupId));
      if (target in list) return session.error('exists', { target });
      list.push(target);
      saveBlack(session.api.adapter.platform, list, isGlobal ? undefined : String(session.groupId));
      return [`manger.msg.black${isGlobal ? 'g' : ''}.add`, [target]];
    });

  ctx
    .command('black del <userId> - manger.descr.black.del')
    .option('g', 'global:boolean - manger.option.black.global')
    .scope(MessageScope.GROUP)
    .access(CommandAccess.MANGER)
    .action((data, session) => {
      const target = data.args[0] as string;
      const isGlobal = data.options.global;
      if (isGlobal && session.userId !== session.api.adapter.config.master) return session.error('no_access_admin');
      const list = loadBlack(session.api.adapter.platform, isGlobal ? undefined : String(session.groupId));
      if (!(target in list)) return session.error('no_exists', { target });
      saveBlack(
        session.api.adapter.platform,
        list.filter((el) => el !== target),
        isGlobal ? undefined : String(session.groupId)
      );
      return [`manger.msg.black${isGlobal ? 'g' : ''}.del`, [target]];
    });

  if (con.exitGroupAddBlack) {
    ctx.on('on_group_decrease', (session) => {
      const list = loadBlack(session.api.adapter.platform, String(session.groupId));
      list.push(String(session.userId));
      saveBlack(session.api.adapter.platform, list, String(session.groupId));
      if (con.exitGroupAddBlackTips) session.quick(['manger.msg.exit_group_add_black', [session.userId]]);
    });
  }

  if (con.blackJoinGroupTips) {
    ctx.on('on_group_increase', (session) => {
      const list = loadBlack(session.api.adapter.platform, String(session.groupId));
      if (String(session.userId) in list) {
        session.quick(['manger.msg.black_join_group.group', [session.userId]]);
        return;
      }
      const list2 = loadBlack(session.api.adapter.platform);
      if (!(String(session.userId) in list2)) return;
      session.quick(['manger.msg.black_join_group.global', [session.userId]]);
    });
  }
}
