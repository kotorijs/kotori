import { Context, Tsu } from 'kotori-bot';
import http from './http';

const bgm1Schema = Tsu.Object({
  results: Tsu.Number().optional(),
  list: Tsu.Array(
    Tsu.Object({
      id: Tsu.Number(),
      name: Tsu.String(),
      name_cn: Tsu.String()
    })
  )
});

const bgm2Schema = Tsu.Union(
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
);

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

export const inject = ['cache'];

export function main(ctx: Context) {
  ctx
    .command('bgm <...content> - bangumi.descr.bgm')
    .option('O', 'order:number bangumi.option.bangumi.order')
    .action(async (data, session) => {
      const name = data.args.join('');
      const order = data.options.order ?? 1;
      const res =
        ctx.cache.get<Tsu.infer<typeof bgm1Schema>>(name) ?? bgm1Schema.parse(await http(`search/subject/${name}`));
      if (!res || !Array.isArray(res.list)) return ['bangumi.msg.bgm.fail', [name]];
      ctx.cache.set(name, res);

      if (order === 0) {
        let list = '';
        for (let init = 0; init < (res.list.length > MAX_LIST ? MAX_LIST : res.list.length); init += 1) {
          const result = res.list[init];
          list += session.format('bangumi.msg.bgm.list', [init + 1, result.name, result.name_cn]);
        }
        return list;
      }

      const result = res.list[(order as number) - 1];
      if (!result) return session.error('num_error');
      const res2 = bgm2Schema.parse(await http(`v0/subjects/${result.id}`));
      if ('title' in res2) return ['bangumi.msg.bgm.fail', [name]];
      return [
        'bangumi.msg.bgm',
        [
          res2.name,
          res2.name_cn,
          res2.summary,
          res2.tags.map((el) => el.name).join(' '),
          `https://bgm.tv/subject/${result.id}`,
          session.el.image(res2.images.large)
        ]
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
      list += session.format('bangumi.msg.bgmc.list', [
        item.name,
        item.name_cn,
        item.air_date,
        session.el.image(item.images.large)
      ]);
    }
    const weekday = session.api.adapter.ctx.i18n.get().includes('en') ? res[dayNum].weekday.en : res[dayNum].weekday.ja;
    return ['bangumi.msg.bgmc', [weekday, list]];
  });
}
