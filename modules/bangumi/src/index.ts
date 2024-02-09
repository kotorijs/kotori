import { Context, Tsu } from 'kotori-bot';
import http from './http';

const bgm1Schema = Tsu.Object({
  results: Tsu.Number().optional(),
  list: Tsu.Array(
    Tsu.Object({
      id: Tsu.Number()
    })
  )
});

const bgm2Schema = Tsu.Union([
  Tsu.Object({
    images: Tsu.Object({
      large: Tsu.String()
    }),
    summary: Tsu.String(),
    name: Tsu.String(),
    name_cn: Tsu.String(),
    tags: Tsu.Array(
      Tsu.Object({
        name: Tsu.String()
      })
    )
  }),
  Tsu.Object({
    title: Tsu.String()
  })
]);

const bgmcSchema = Tsu.Array(
  Tsu.Object({
    weekday: Tsu.Object({
      en: Tsu.String(),
      cn: Tsu.String(),
      ja: Tsu.String()
    }),
    items: Tsu.Array(
      Tsu.Object({
        name: Tsu.String(),
        name_cn: Tsu.String(),
        air_date: Tsu.String(),
        images: Tsu.Object({
          large: Tsu.String()
        })
      })
    )
  })
);

const MAX_LIST = 10;

export const lang = [__dirname, '../locales'];

export const inject = [''];

export function main(ctx: Context) {
  ctx.command('bgm <content> [order:number=1] - bangumi.descr.bgm').action(async (data, session) => {
    const prop = `bgm_${data.args[0]}`;
    const res =
      ctx.cache.get<Tsu.infer<typeof bgm1Schema>>(prop) ??
      bgm1Schema.parse(await http(`search/subject/${data.args[0]}`));
    if (!res || !Array.isArray(res.list)) return ['bangumi.msg.bgm.fail', { input: data.args[0] }];
    ctx.cache.set(prop, res);

    if (data.args[1] === 0) {
      let list = '';
      for (let init = 0; init < (res.list.length > MAX_LIST ? MAX_LIST : res.list.length); init += 1) {
        const result = res.list[init];
        list += session.format('bangumi.msg.bgm.list', {
          ...result,
          num: init + 1
        });
      }
      return ['bangumi.msg.bgm.lists', { list }];
    }

    const result = res.list[(data.args[1] as number) - 1];
    if (!result) return session.error('num_error');
    const res2 = bgm2Schema.parse(await http(`v0/subjects/${result.id}`));
    if ('title' in res2) return ['bangumi.msg.bgm.fail', { input: data.args[0] }];
    return [
      'bangumi.msg.bgm',
      {
        name: res2.name,
        name_cn: res2.name_cn,
        summary: res2.summary,
        tags: res2.tags.map((el) => el.name).join(' '),
        url: `https://bgm.tv/subject/${result.id}`,
        image: session.el.image(res2.images.large)
      }
    ];
  });

  ctx.command('bgmc - bangumi.descr.bgmc').action(async (_, session) => {
    const res = bgmcSchema.parse(await http(`calendar`));

    let dayNum = new Date().getDay();
    dayNum = dayNum === 0 ? 6 : dayNum - 1;
    const { items } = res[dayNum];
    let list = '';
    for (let init = 0; init < 3; init += 1) {
      const item = items[init];
      list += session.format('bangumi.msg.bgmc.list', {
        name: item.name,
        name_cn: item.name_cn,
        air_date: item.air_date,
        image: session.el.image(item.images.large)
      });
    }
    const weekday = session.api.adapter.ctx.i18n.get().includes('en') ? res[dayNum].weekday.en : res[dayNum].weekday.ja;
    return ['bangumi.msg.bgmc', { weekday, list }];
  });
}
