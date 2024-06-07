import { Context, Tsu, getRandomInt } from 'kotori-bot';

interface Good {
  morning: Record<string, number>;
  night: Record<string, number>;
}

export const lang = [__dirname, '../locales'];

export const inject = ['file'];

export const config = Tsu.Object({
  getupTimeLess: Tsu.Number().default(6),
  getupTimeLate: Tsu.Number().default(18),
  sleepTimeLess: Tsu.Number().default(3),
  sleepTimeLater: Tsu.Tuple([Tsu.Number(), Tsu.Number()]).default([1, 7]),
  sleepTimeLate: Tsu.Tuple([Tsu.Number(), Tsu.Number()]).default([23, 1]),
  sleepTimeNormal: Tsu.Tuple([Tsu.Number(), Tsu.Number()]).default([20, 23])
});

export type Config = Tsu.infer<typeof config>;

function getSex(val: string) {
  switch (val) {
    case 'male':
      return 'goodnight.msg.morning.male';
    case 'female':
      return 'goodnight.msg.morning.female';
    default:
      return getSex(getRandomInt(1) === 1 ? 'male' : 'female');
  }
}

export function main(ctx: Context, config: Config) {
  const getTodayPath = (yesterday: boolean = false) =>
    `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${yesterday ? new Date().getDate() - 1 : new Date().getDate()}.json`;
  const defaultData: Good = { morning: {}, night: {} };
  const loadTodayData = (yesterday: boolean = false) =>
    ctx.file.load<Good>(getTodayPath(yesterday), 'json', defaultData) || defaultData;
  const saveTodayData = (data: Good) => ctx.file.save(getTodayPath(), data);

  ctx.regexp(/^(早|早安|早上好)$/, (_, session) => {
    const record = loadTodayData();
    const at = session.el.at(session.userId);
    const prop = `${session.api.adapter.identity}${session.userId}`;
    if (prop in record.morning) return ['goodnight.msg.morning.already', { at }];

    const hours = new Date().getHours();
    if (hours < config.getupTimeLess) return ['goodnight.msg.morning.early', { at, hour: config.getupTimeLess }];

    record.morning[prop] = new Date().getTime();
    saveTodayData(record);
    const count = Object.keys(record.morning).length;
    // if (count <= 10) addExp(data.group_id!, session.userId, 15);
    // if (count > 10 && count <= 20) addExp(data.group_id!, session.userId, 5);
    const sex = getSex(session.sender.sex);
    if (hours < 12) return ['goodnight.msg.morning.morning', { at, count, sex }];
    if (hours >= 12 && hours < config.getupTimeLate) return ['goodnight.msg.morning.afternoon', { at, count, sex }];
    return ['goodnight.msg.morning.late', { at, count, sex }];
  });

  ctx.regexp(/^(晚|晚安|晚上好)$/, (_, session) => {
    const record = loadTodayData();
    const at = session.el.at(session.userId)!;
    const prop = `${session.api.adapter.identity}${session.userId}`;
    if (prop in record.night) return ['goodnight.msg.night.already', { at }];

    const record2 = loadTodayData(true);
    if (!(prop in record.morning) && !(prop in record2.morning)) return ['goodnight.msg.night.not', { at }];

    const nowTime = new Date().getTime();
    const timecal = nowTime - (record.morning[prop] || record2.morning[prop]);
    if (timecal < config.sleepTimeLess * 60 * 60 * 1000) return ['goodnight.msg.night.less', { at }];

    record.night[prop] = nowTime;
    saveTodayData(record);
    const time = ctx.i18n.rtime(timecal, 'hours');
    const hours = new Date().getHours();
    const { sleepTimeLater: later, sleepTimeLate: late, sleepTimeNormal: normal } = config;
    if (hours >= later[0] && hours < later[1]) return ['goodnight.msg.night.later', { at, time }];
    if (hours >= late[0] || hours < late[1]) return ['goodnight.msg.night.late', { at, time }];
    if (hours >= normal[0] && hours < normal[1]) return ['goodnight.msg.night.normal', { at, time }];
    return ['goodnight.msg.night.early', { at, time }];
  });
}
