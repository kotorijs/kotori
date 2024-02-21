import { Context, MessageScope, Tsu, getRandomInt } from 'kotori-bot';

export const lang = [__dirname, '../locales'];

export const inject = ['file'];

export const config = Tsu.Object({
  max: Tsu.Number().default(4)
});

type Bottle = [string, number, number | string, (number | string)?];

const getZero = () => {
  const today = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
  today.setHours(0);
  today.setMinutes(0);
  today.setSeconds(0);
  today.setMilliseconds(0);
  return today.getTime();
};

export function main(ctx: Context, conf: Tsu.infer<typeof config>) {
  const getBottle = (platform: string) => ctx.file.load(`${platform}.json`, 'json', []) as Bottle[];
  const setBottle = (platform: string, data: Bottle[]) => ctx.file.save(`${platform}.json`, data, 'json');

  ctx
    .command('throw <content> - drift_bottle.descr.throw')
    .action((data, session) => {
      const at = session.el.at(session.userId);
      const bottles = getBottle(session.api.adapter.platform);
      const zero = getZero();
      let count = 0;
      bottles.forEach((Element) => {
        if (Element[3] !== session.userId) return;
        if (Element[1] < zero) return;
        count += 1;
      });
      if (count > conf.max) return ['drift_bottle.msg.throw.fail', [at, conf.max]];
      bottles.push([data.args[0] as string, new Date().getTime(), session.groupId!, session.userId!]);
      setBottle(session.api.adapter.platform, bottles);
      return ['drift_bottle.msg.throw.info', [at]];
    })
    .scope(MessageScope.GROUP);

  ctx
    .command('pick - drift_bottle.descr.pick')
    .action((_, session) => {
      const data = getBottle(session.api.adapter.platform);
      if (!data || data.length <= 0) return 'drift_bottle.msg.pick.none';
      const bottle = data[getRandomInt(data.length - 1)];
      return ['drift_bottle.msg.pick.info', [bottle[0], session.i18n.time(new Date(bottle[1])), bottle[2]]];
    })
    .scope(MessageScope.GROUP);
}
