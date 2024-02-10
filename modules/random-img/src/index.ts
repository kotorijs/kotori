import { Tsu, type Elements, Context } from 'kotori-bot';

const sexSchema = Tsu.Object({
  data: Tsu.Array(
    Tsu.Object({
      pid: Tsu.Number(),
      title: Tsu.String(),
      author: Tsu.String(),
      tags: Tsu.Array(Tsu.String()),
      url: Tsu.String()
    })
  ).optional()
});

const sexhSchema = Tsu.Object({
  data: Tsu.Object({
    url: Tsu.String(),
    tag: Tsu.Array(Tsu.String())
  }).optional()
});

const quick = (url: string, el: Elements) => el.image(url) || 'corei18n.template.unsupported';

export const lang = [__dirname, '../locales'];

export function main(ctx: Context) {
  ctx.command('sex [tags] - random_img.descr.sex').action(async (data, session) => {
    session.quick('random_img.msg.sex.tips');
    const res = sexSchema.parse(
      await ctx.http.get(`https://hotaru.icu/api/seimg/v2/`, { tag: data.args[0] || '', r18: 0 })
    );
    if (!res.data) return ['random_img.msg.sex.fail', { input: data.args[0] }];

    const info = res.data[0];
    session.quick(['random_img.msg.sex', { ...info, tags: info.tags.join(' ') }]);
    return ['random_img.msg.sex.image', { image: session.el.image(info.url) }];
  });

  ctx.command('sexh - random_img.descr.sexh').action(async (data, session) => {
    session.quick('random_img.msg.sexh.tips');
    const res = sexhSchema.parse(await ctx.http.get('https://hotaru.icu/api/huimg/'));
    if (!res.data) return ['random_img.msg.sexh.fail', { input: data.args[0] }];
    const info = res.data;
    return ['random_img.msg.sexh', { tags: info.tag.join(' '), image: session.el.image(info.url) }];
  });

  ctx.command('bing - random_img.descr.bing').action((_, session) => [
    'random_img.msg.bing',
    {
      image: quick('https://api.hotaru.icu/api/bing', session.el)
    }
  ]);

  ctx.command('day - random_img.descr.day').action((_, session) => [
    'random_img.msg.day',
    {
      image: quick(`https://api.hotaru.icu/api/60s?apikey=1c42abefdb5f7cc463dbc88e82d561b1&area=日本神户市`, session.el)
    }
  ]);

  ctx.command('earth - random_img.descr.earth').action((_, session) => [
    'random_img.msg.earth',
    {
      image: quick('https://img.nsmc.org.cn/CLOUDIMAGE/FY4A/MTCC/FY4A_DISK.jpg', session.el)
    }
  ]);

  ctx.command('china - random_img.descr.china').action((_, session) => [
    'random_img.msg.china',
    {
      image: quick('https://img.nsmc.org.cn/CLOUDIMAGE/FY4A/MTCC/FY4A_CHINA.jpg', session.el)
    }
  ]);
}
