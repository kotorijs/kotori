import { Context, Tsu } from 'kotori-bot';

export const lang = [__dirname, '../locales'];

export function main(ctx: Context) {
  ctx.command('weather <area> - weather.descr.weather').action(async data => {
    const content = Tsu.String().parse(
      await ctx.http.get('https://api.hotaru.icu/api/weather', { msg: data.args[0], b: 1 }),
    );
    return ['weather.msg.weather', { content }];
  });
}
