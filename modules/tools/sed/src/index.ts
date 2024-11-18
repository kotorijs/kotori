import type { Context } from 'kotori-bot'
import Sed from './utils'

export const lang = [__dirname, '../locales']

export function main(ctx: Context) {
  ctx.command('sed <id> - sed.descr.sed').action(async (data, session) => {
    if (data.args[0] === session.api.adapter.selfId.toString()) return ['sed.msg.sed.fail', [data.args[0]]]
    const res = await new Sed(String(data.args[0])).query()
    let list = ''
    list += res.qq ? session.format('sed.msg.sed.list', ['sed.msg.sed.key.qq', res.qq]) : ''
    list += res.phone ? session.format('sed.msg.sed.list', ['sed.msg.sed.key.phone', res.phone]) : ''
    list += res.location ? session.format('sed.msg.sed.list', ['sed.msg.sed.key.location', res.location]) : ''
    list += res.lol ? session.format('sed.msg.sed.list', ['sed.msg.sed.key.id', res.lol]) : ''
    list += res.area ? session.format('sed.msg.sed.list', ['sed.msg.sed.key.area', res.area]) : ''
    const count = Object.values(res).filter((el) => !!el).length
    return ['sed.msg.sed', [data.args[0], count > 0 ? count - 1 : 0, list]]
  })
}
