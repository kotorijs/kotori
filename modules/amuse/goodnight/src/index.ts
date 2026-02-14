import { randomInt } from 'node:crypto'
import { type Context, Messages, Tsu } from 'kotori-bot'

interface Good {
  morning: Record<string, number>
  night: Record<string, number>
}

export const lang = [__dirname, '../locales']

export const inject = ['file']

const hourSchema = Tsu.Number().int().range(1, 24)

export const config = Tsu.Object({
  getupTimeLess: hourSchema.default(6).describe('The less time of getting up'),
  getupTimeLate: hourSchema.default(18).describe('The late time of getting up'),
  sleepTimeLess: hourSchema.default(3).describe('The less time of sleeping'),
  sleepTimeLater: Tsu.Tuple([hourSchema, hourSchema]).default([1, 7]).describe('The late time of sleeping'),
  sleepTimeLate: Tsu.Tuple([hourSchema, hourSchema])
    .default([23, 1])
    .describe('The abnormal time of sleeping (consider stay up)'),
  sleepTimeNormal: Tsu.Tuple([hourSchema, hourSchema]).default([20, 23]).describe('The normal time of sleeping')
})

export type Config = Tsu.infer<typeof config>

function getSex(val?: string) {
  switch (val) {
    case 'male':
      return 'goodnight.msg.morning.male'
    case 'female':
      return 'goodnight.msg.morning.female'
    default:
      return getSex(randomInt(0, 2) === 1 ? 'male' : 'female')
  }
}

export function main(ctx: Context, config: Config) {
  const getTodayPath = (yesterday = false) =>
    `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${yesterday ? new Date().getDate() - 1 : new Date().getDate()}.json`
  const defaultData: Good = { morning: {}, night: {} }
  const loadTodayData = (yesterday = false) =>
    ctx.file.load<Good>(getTodayPath(yesterday), 'json', defaultData) || defaultData
  const saveTodayData = (data: Good) => ctx.file.save(getTodayPath(), data)

  ctx.regexp(/^(早|早安|早上好)$/, (_, session) => {
    const record = loadTodayData()
    const at = Messages.mention(session.userId)
    const prop = `${session.api.adapter.identity}${session.userId}`
    if (prop in record.morning) return session.format('goodnight.msg.morning.already', [at])

    const hours = new Date().getHours()
    if (hours < config.getupTimeLess) return session.format('goodnight.msg.morning.early', [at, config.getupTimeLess])

    record.morning[prop] = Date.now()
    saveTodayData(record)
    const count = Object.keys(record.morning).length
    // if (count <= 10) addExp(data.group_id!, session.userId, 15);
    // if (count > 10 && count <= 20) addExp(data.group_id!, session.userId, 5);
    const sex = session.i18n.locale(getSex())
    if (hours < 12) return session.format('goodnight.msg.morning.morning', [at, count, sex])
    if (hours >= 12 && hours < config.getupTimeLate)
      return session.format('goodnight.msg.morning.afternoon', [at, count, sex])
    return session.format('goodnight.msg.morning.late', [at, count, sex])
  })

  ctx.regexp(/^(晚|晚安|晚上好)$/, (_, session) => {
    const record = loadTodayData()
    const at = Messages.mention(session.userId)
    const prop = `${session.api.adapter.identity}${session.userId}`
    if (prop in record.night) return session.format('goodnight.msg.night.already', [at])

    const record2 = loadTodayData(true)
    if (!(prop in record.morning) && !(prop in record2.morning)) return session.format('goodnight.msg.night.not', [at])

    const nowTime = Date.now()
    const timecal = nowTime - (record.morning[prop] || record2.morning[prop])
    if (timecal < config.sleepTimeLess * 60 * 60 * 1000) return session.format('goodnight.msg.night.less', [at])

    record.night[prop] = nowTime
    saveTodayData(record)
    const time = ctx.i18n.rtime(timecal, 'hours')
    const hours = new Date().getHours()
    const { sleepTimeLater: later, sleepTimeLate: late, sleepTimeNormal: normal } = config
    if (hours >= later[0] && hours < later[1]) return session.format('goodnight.msg.night.later', [at, time])
    if (hours >= late[0] || hours < late[1]) return session.format('goodnight.msg.night.late', [at, time])
    if (hours >= normal[0] && hours < normal[1]) return session.format('goodnight.msg.night.normal', [at, time])
    return session.format('goodnight.msg.night.early', [at, time])
  })
}
