/*
 * @Author: Hotaru biyuehuya@gmail.com
 * @Blog: https://hotaru.icu
 * @Date: 2023-07-30 11:33:15
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2024-07-30 19:25:55
 */
import { type Context, Messages, Tsu, UserAccess } from 'kotori-bot'

export const lang = [__dirname, '../locales']

export const inject = ['file', 'server']

export const config = Tsu.Object({
  max: Tsu.Number().default(30).describe('The maximum length of the dick'),
  min: Tsu.Number().default(-30).describe('The minimum length of the dick'),
  joke: Tsu.Number().default(10).describe('Send a joke when the length is less than value'),
  avgMinNum: Tsu.Number().default(5).describe('The minimum at avg rank'),
  probability: Tsu.Number().default(0.45).describe('不怀孕的概率 (0-1)'),
  cutProbability: Tsu.Number().default(0.4).describe('寸止失败的概率 (0-1)'),
  maxCount: Tsu.Number().default(4).describe('单个用户每日最大社次数'),
  maxCount2: Tsu.Number().default(2).describe('单个用户每日最大被社次数')
})

type Config = Tsu.infer<typeof config>
type TodayData = Record<string | number, number>
type StatData = Record<string, [number, number, number, number]>

interface CumData {
  [userId: string]: {
    given: number
    received: number
    lastTime: number
  }
}

export function main(ctx: Context, config: Config) {
  const getNewLength = () => config.min + Math.floor(Math.random() * (config.max - config.min + 1))
  const getTodayPath = () => `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDay()}.json`
  const loadTodayData = () => ctx.file.load<TodayData>(getTodayPath(), 'json', {})
  const saveTodayData = (data: TodayData) => ctx.file.save(getTodayPath(), data)
  const loadStatData = (): StatData => ctx.file.load<StatData>('stat.json', 'json', {})
  const saveStatData = (data: StatData) => ctx.file.save('stat.json', data)

  const DATA_FILE = 'cum_you_data.json'
  const loadData = () => ctx.file.load<CumData>(DATA_FILE, 'json', {})
  const saveData = (data: CumData) => ctx.file.save(DATA_FILE, data)
  const getTodayStart = () => new Date(new Date().setHours(0, 0, 0, 0)).getTime()

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

  // 核心命令：cum
  ctx
    .command('cum [user:string] - 社保你的群友')
    .alias('社保')
    .option('C', 'cut:boolean 寸止模式')
    .action(async ({ args, options: { cut } }, session) => {
      const data = loadData()
      const todayStart = getTodayStart()

      const senderId = `${session.api.adapter.identity}${session.userId}`
      const senderRecord = data[senderId] || { given: 0, received: 0, lastTime: 0 }
      if (senderRecord.lastTime < todayStart) {
        senderRecord.given = 0
        senderRecord.received = 0
        senderRecord.lastTime = Date.now()
      }

      if (senderRecord.given >= config.maxCount) {
        return session.quick(['杂鱼欧尼酱，你今天已经社了 {0} 次了，身体要被掏空了哦！休息下吧。', [config.maxCount]])
      }

      const targetId = args[0] ?? session.userId
      const targetFullId = `${session.api.adapter.identity}${targetId}`
      const targetRecord = data[targetFullId] || { given: 0, received: 0, lastTime: 0 }
      if (targetRecord.lastTime < todayStart) {
        targetRecord.given = 0
        targetRecord.received = 0
        targetRecord.lastTime = Date.now()
      }

      if (targetRecord.received >= config.maxCount2) {
        return session.quick(['群友 {0} 的小肚肚已经装不下了，请不要再社了！', [Messages.mention(targetId)]])
      }

      const cutFailed = Math.random() < config.cutProbability
      const noPregnancy = Math.random() < config.probability
      const babyTypes = [
        '一只男娃',
        '一只女娃',
        '一对男娃双胞胎',
        '一对女娃双胞胎',
        '三胞胎！',
        '一个大胖小子',
        '一对龙凤双胞胎',
        '一只小巧小女儿'
      ]
      const pickBaby = () => babyTypes[Math.floor(Math.random() * babyTypes.length)]

      if (cut) {
        if (cutFailed) {
          senderRecord.given++
          targetRecord.received++
          const babyStr = noPregnancy ? '庆幸的是没有怀孕' : `群友诞下了 ${pickBaby()}`
          session.quick([`你在 cum 群友 {0} 的过程中使用了寸止，但你没忍住！${babyStr}`, [Messages.mention(targetId)]])
        } else {
          // 寸止成功：不计数，不怀孕
          session.quick(['你在 cum 群友 {0} 的过程中成功寸止！(好腰力！)', [Messages.mention(targetId)]])
        }
      } else {
        senderRecord.given++
        targetRecord.received++
        if (noPregnancy) {
          session.quick(['你社保了群友 {0}，但她并没有怀孕……', [Messages.mention(targetId)]])
        } else {
          session.quick([`你社保了群友 {0} 并诞下了 ${pickBaby()}`, [Messages.mention(targetId)]])
        }
      }

      const now = Date.now()
      senderRecord.lastTime = now
      targetRecord.lastTime = now
      data[senderId] = senderRecord
      data[targetFullId] = targetRecord
      saveData(data)
    })

  ctx
    .command('cum-check [user:string] - 查看社保统计')
    .alias('社保查询')
    .action(({ args }, session) => {
      const data = loadData()
      const targetId = args[0] ?? session.userId
      const fullId = `${session.api.adapter.identity}${targetId}`
      const record = data[fullId]
      const todayStart = getTodayStart()

      let given = 0
      let received = 0
      if (record && record.lastTime >= todayStart) {
        given = record.given
        received = record.received
      }

      return session.format(
        `群友 {0} 今日统计：\n主动社了：${given}/${config.maxCount} 次\n被动受孕：${received}/${config.maxCount2} 次`,
        [Messages.mention(targetId)]
      )
    })

  ctx
    .command('cum-reset [user:string] - 重置次数')
    .alias('社保重置')
    .access(UserAccess.MANGER)
    .action(({ args }, session) => {
      const data = loadData()
      const targetId = args[0] ?? session.userId
      const fullId = `${session.api.adapter.identity}${targetId}`

      data[fullId] = {
        given: 0,
        received: 0,
        lastTime: Date.now()
      }
      saveData(data)

      return session.format('已手动修正：群友 {0} 的被社次数已重置', [Messages.mention(targetId)])
    })
}
