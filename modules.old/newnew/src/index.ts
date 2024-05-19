/*
 * @Author: Hotaru biyuehuya@gmail.com
 * @Blog: https://hotaru.icu
 * @Date: 2023-07-30 11:33:15
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2024-02-14 14:20:08
 */
import { Context, Tsu } from 'kotori-bot';

export const lang = [__dirname, '../locales'];

export const inject = ['file', 'server'];

export const config = Tsu.Object({
  max: Tsu.Number().default(30),
  min: Tsu.Number().default(-30),
  joke: Tsu.Number().default(10),
  avgMinNum: Tsu.Number().default(5)
});

type Config = Tsu.infer<typeof config>;
type TodayData = Record<string | number, number>;
type StatData = Record<string, [number, number, number, number]>;

export function main(ctx: Context, config: Config) {
  const getNewLength = () => config.min + Math.floor(Math.random() * (config.max - config.min + 1));
  const getTodayPath = () => `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDay()}.json`;
  const loadTodayData = () => (ctx.file.load(getTodayPath(), 'json', {}) as TodayData) || {};
  const saveTodayData = (data: TodayData) => ctx.file.save(getTodayPath(), data);
  const loadStatData = (): StatData => (ctx.file.load('stat.json', 'json', {}) as StatData) || {};
  const saveStatData = (data: StatData) => ctx.file.save('stat.json', data);

  ctx.midware((next, session) => {
    const s = session;
    if (s.message === `${s.api.adapter.config['command-prefix']}今日长度`) s.message = '今日长度';
    next();
  });

  ctx.regexp(/^今日长度$/, (_, session) => {
    /* 加载数据 */
    const id = `${session.api.adapter.platform}${session.userId}`;
    const today = loadTodayData();
    const todayLength = typeof today[id] === 'number' ? today[id] : getNewLength();

    /* 发送消息 */
    const params = [session.el.at(session.userId), todayLength];
    if (todayLength <= 0) session.quick(['newnew.msg.today_length.info.2', params]);
    else if (todayLength > 0 && todayLength <= config.joke) session.quick(['newnew.msg.today_length.info.1', params]);
    else session.quick(['newnew.msg.today_length.info.0', params]);

    /* 如果数据中不存在则更新数据 */
    if (typeof today[id] === 'number') return;
    // const result = parseInt((((todayLength + 20) / 10) * 2).toFixed(), 10);
    // addExp(session.groupId!, session.userId, result < 0 ? 0 : result); custom service
    today[id] = todayLength;
    saveTodayData(today);
    /* 更新stat */
    const stat = loadStatData();
    const person = stat[id];
    if (Array.isArray(person) /* && person.length === 4 */) {
      if (todayLength <= person[0]) person[0] = todayLength;
      if (todayLength >= person[1]) person[1] = todayLength;
      person[2] += 1;
      person[3] += todayLength;
    } else {
      stat[id] = [todayLength, todayLength, 1, todayLength];
    }
    saveStatData(stat);
  });

  ctx.regexp(/^我的长度$/, (_, session) => {
    const stat = loadStatData();
    const person = stat[`${session.api.adapter.platform}${session.userId}`];
    if (!person || person.length <= 0) return ['newnew.msg.my_length.fail', [session.el.at(session.userId)]];
    return [
      'newnew.msg.my_length',
      [session.el.at(session.userId), person[1], person[0], person[2], person[3], (person[3] / person[2]).toFixed(2)]
    ];
  });

  ctx.regexp(/^平均排行$/, (_, session) => {
    const stat = loadStatData();
    const statOrigin = loadStatData();
    if (Object.keys(stat).length <= 0) return 'newnew.msg.avg_ranking.fail';
    Object.keys(stat).forEach((key) => {
      const item = stat[key];
      item[3] /= item[2];
    });
    const entries = Object.entries(stat).filter((val) => val[0].startsWith(session.api.adapter.platform));
    entries.sort((a, b) => b[1][3] - a[1][3]);

    let list = '';
    let num = 1;
    entries.forEach((entry) => {
      if (num > 20) return;
      const nums = entry[1][2];
      if (nums < config.avgMinNum) return;
      list += session.format('newnew.msg.avg_ranking.list', [
        num,
        entry[0].slice(session.api.adapter.platform.length),
        entry[1][3].toFixed(2),
        nums,
        statOrigin[entry[0]][3]
      ]);
      num += 1;
    });
    return ['newnew.msg.avg_ranking', [list]];
  });

  ctx.regexp(/^今日排行$/, (_, session) => {
    const today = loadTodayData();
    if (today.length <= 0) return 'newnew.msg.today_ranking.fail';

    const entries = Object.entries(today).filter((val) => val[0].startsWith(session.api.adapter.platform));
    entries.sort((a, b) => b[1] - a[1]);

    let list = '';
    let num = 1;
    entries.forEach((entry) => {
      if (num > 20) return;
      list += session.format('newnew.msg.today_ranking.list', [
        num,
        entry[0].slice(session.api.adapter.platform.length),
        entry[1]
      ]);
      num += 1;
    });
    return ['newnew.msg.today_ranking', [list]];
  });
}
