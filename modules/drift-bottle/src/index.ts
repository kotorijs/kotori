import { randomInt } from 'node:crypto'
import { type Context, MessageScope, Messages, Tsu } from 'kotori-bot'

export const lang = [__dirname, '../locales']

export const inject = ['file']

export const config = Tsu.Object({
  max: Tsu.Number().default(4)
})

type Bottle = [string, number, number | string, (number | string)?]

const getZero = () => {
  const today = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())
  today.setHours(0)
  today.setMinutes(0)
  today.setSeconds(0)
  today.setMilliseconds(0)
  return today.getTime()
}

export function main(ctx: Context, conf: Tsu.infer<typeof config>) {
  const getBottle = (bot: string) => ctx.file.load<Bottle[]>(`${bot}.json`, 'json', [])
  const setBottle = (bot: string, data: Bottle[]) => ctx.file.save(`${bot}.json`, data, 'json')

  ctx
    .command('throw <content> - drift_bottle.descr.throw')
    .scope(MessageScope.GROUP)
    .action((data, session) => {
      const bottles = getBottle(session.api.adapter.identity)
      const zero = getZero()
      const count = bottles.reduce((count, Element) => {
        if (Element[3] !== session.userId) return count
        if (Element[1] < zero) return count
        return count + 1
      }, 0)
      if (count > conf.max)
        return session.format('drift_bottle.msg.throw.fail', [Messages.mention(session.userId), conf.max])

      bottles.push([data.args[0] as string, new Date().getTime(), session.groupId, session.userId])
      setBottle(session.api.adapter.identity, bottles)
      return session.format('drift_bottle.msg.throw.info', [Messages.mention(session.userId)])
    })

  ctx
    .command('pick - drift_bottle.descr.pick')
    .action((_, session) => {
      const data = getBottle(session.api.adapter.identity)
      if (!data || data.length <= 0) return 'drift_bottle.msg.pick.none'

      const bottle = data[randomInt(0, data.length - 1)]
      return session.format('drift_bottle.msg.pick.info', [
        bottle[0],
        session.i18n.time(new Date(bottle[1])),
        bottle[2]
      ])
    })
    .scope(MessageScope.GROUP)
}
