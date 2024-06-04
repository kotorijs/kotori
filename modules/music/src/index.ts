import { Context, Tsu } from 'kotori-bot';

const musicSchema = Tsu.Object({
  data: Tsu.Array(
    Tsu.Object({
      link: Tsu.String(),
      songid: Tsu.Number(),
      title: Tsu.String(),
      author: Tsu.String(),
      url: Tsu.String(),
      pic: Tsu.String()
    })
  ).optional()
});

const MAX_LIST = 10;

export const lang = [__dirname, '../locales'];

export const inject = ['cache'];

export function main(ctx: Context) {
  ctx
    .command('music <...name> - music.descr.music')
    .option('o', 'order:number music.option.music.order')
    .action(async (data, session) => {
      const name = data.args.join('');
      const order = data.options.order ?? 1;
      const res =
        ctx.cache.get<Tsu.infer<typeof musicSchema>>(name) ??
        musicSchema.parse(await ctx.http.get('https://api.hotaru.icu/api/netease', { name }));
      ctx.cache.set(name, res);
      if (!res.data) return ['music.msg.music.fail', [name]];

      if (order === 0) {
        let list = '';
        for (let init = 0; init < (res.data.length > MAX_LIST ? MAX_LIST : res.data.length); init += 1) {
          const song = res.data[init];
          list += session.format('music.msg.music.list', [init + 1, song.title ?? '', song.author ?? '']);
        }
        return list;
      }

      const song = res.data[(order as number) - 1];
      if (!song) return 'music.msg.music.fail.order';

      if (session.api.adapter.platform === 'onebot') session.send(`[CQ:music,type=163,id=${song.songid}]`);

      return session.quick([
        'music.msg.music',
        [song.songid, song.title, song.author, song.url, session.el.image(song.pic)]
      ]);
    })
    .help('music.help.music');
}
