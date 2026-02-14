/*
 * @Author: Hotaru biyuehuya@gmail.com
 * @Blog: https://hotaru.icu
 * @Date: 2023-07-30 11:33:15
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2024-07-30 19:25:55
 */
import { type Context, Messages, Tsu } from 'kotori-bot'

export const lang = [__dirname, '../locales']

export const inject = ['file', 'server']

export const config = Tsu.Object({
  max: Tsu.Number().default(30).describe('The maximum length of the dick'),
  min: Tsu.Number().default(-30).describe('The minimum length of the dick'),
  joke: Tsu.Number().default(10).describe('Send a joke when the length is less than value'),
  avgMinNum: Tsu.Number().default(5).describe('The minimum at avg rank')
})

type Config = Tsu.infer<typeof config>
type TodayData = Record<string | number, number>
type StatData = Record<string, [number, number, number, number]>

export function main(ctx: Context, config: Config) {
  const getNewLength = () => config.min + Math.floor(Math.random() * (config.max - config.min + 1))
  const getTodayPath = () => `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDay()}.json`
  const loadTodayData = () => ctx.file.load<TodayData>(getTodayPath(), 'json', {})
  const saveTodayData = (data: TodayData) => ctx.file.save(getTodayPath(), data)
  const loadStatData = (): StatData => ctx.file.load<StatData>('stat.json', 'json', {})
  const saveStatData = (data: StatData) => ctx.file.save('stat.json', data)

  ctx
    .command('dick - 获取今日牛牛长度')
    .shortcut('今日长度')
    .action((_, session) => {
      /* 加载数据 */
      const id = `${session.api.adapter.identity}${session.userId}`
      const today = loadTodayData()
      const todayLength = typeof today[id] === 'number' ? today[id] : getNewLength()

      /* 发送消息 */
      const params = [Messages.mention(session.userId), todayLength]
      if (todayLength <= 0) session.quick(['newnew.msg.today_length.info.2', params])
      else if (todayLength > 0 && todayLength <= config.joke) session.quick(['newnew.msg.today_length.info.1', params])
      else session.quick(['newnew.msg.today_length.info.0', params])

      /* 如果数据中不存在则更新数据 */
      if (typeof today[id] === 'number') return
      // const result = parseInt((((todayLength + 20) / 10) * 2).toFixed(), 10);
      // addExp(session.groupId!, session.userId, result < 0 ? 0 : result); custom service
      today[id] = todayLength
      saveTodayData(today)
      /* 更新stat */
      const stat = loadStatData()
      const person = stat[id]
      if (Array.isArray(person) /* && person.length === 4 */) {
        if (todayLength <= person[0]) person[0] = todayLength
        if (todayLength >= person[1]) person[1] = todayLength
        person[2] += 1
        person[3] += todayLength
      } else {
        stat[id] = [todayLength, todayLength, 1, todayLength]
      }
      saveStatData(stat)
    })

  ctx
    .command('mydick - 获取我的牛牛长度')
    .shortcut('我的长度')
    .action((_, session) => {
      const stat = loadStatData()
      const person = stat[`${session.api.adapter.identity}${session.userId}`]
      const params = [Messages.mention(session.userId)]
      if (!person || person.length <= 0) return session.format('newnew.msg.my_length.fail', params)
      return session.format('newnew.msg.my_length', [
        params[0],
        person[1],
        person[0],
        person[2],
        person[3],
        (person[3] / person[2]).toFixed(2)
      ])
    })

  ctx
    .command('avgdick - 查看牛牛长度平均排行')
    .shortcut('平均排行')
    .action((_, session) => {
      const stat = loadStatData()
      const statOrigin = loadStatData()
      if (Object.keys(stat).length <= 0) return 'newnew.msg.avg_ranking.fail'

      for (const key in stat) {
        const item = stat[key]
        item[3] /= item[2]
      }
      const entries = Object.entries(stat).filter((val) => val[0].startsWith(session.api.adapter.identity))
      entries.sort((a, b) => b[1][3] - a[1][3])

      let list = ''
      let num = 1
      for (const entry of entries) {
        if (num > 20) continue
        const nums = entry[1][2]
        if (nums < config.avgMinNum) continue
        list += session.format('newnew.msg.avg_ranking.list', [
          num,
          entry[0].slice(session.api.adapter.identity.length),
          entry[1][3].toFixed(2),
          nums,
          statOrigin[entry[0]][3]
        ])
        num += 1
      }
      return session.format('newnew.msg.avg_ranking', [list])
    })

  ctx
    .command('daydick - 查看牛牛长度今日排行')
    .shortcut('今日排行')
    .action((_, session) => {
      const today = loadTodayData()
      if (today.length <= 0) return 'newnew.msg.today_ranking.fail'

      const entries = Object.entries(today).filter((val) => val[0].startsWith(session.api.adapter.identity))
      entries.sort((a, b) => b[1] - a[1])

      let list = ''
      let num = 1
      for (const entry of entries) {
        if (num > 20) continue
        list += session.format('newnew.msg.today_ranking.list', [
          num,
          entry[0].slice(session.api.adapter.identity.length),
          entry[1]
        ])
        num += 1
      }
      return session.format('newnew.msg.today_ranking', [list])
    })
}
