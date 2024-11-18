/*
 * @Author: hotaru biyuehuya@gmail.com
 * @Blog: https://hotaru.icu
 * @Date: 2023-07-11 14:18:27
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2024-07-29 18:03:20
 */
import { type Context, Symbols } from 'kotori-bot'

export const lang = [__dirname, '../locales']

export const inject = ['file']

type Data = Record<string, string>

export function main(ctx: Context) {
  const load = (bot: string) => ctx.file.load<Data>(`${bot}.json`, 'json', {})
  const save = (bot: string, data: Data) => ctx.file.save(`${bot}.json`, data)

  ctx.midware((next, session) => {
    const list = load(session.api.adapter.identity)
    const msg = session.message.toString()
    if (list[msg] || session.message.trim() in list) session.message = list[msg]
    next()
  }, 90)

  ctx.command('alias query - alias.descr.alias.query').action((_, session) => {
    const list = Object.entries(load(session.api.adapter.identity) ?? {})
      .map((el) => session.format('alias.msg.alias.list', [...el]))
      .join('')
    return session.format('alias.msg.alias.query', [list])
  })

  ctx.command('alias add <alias> <...command> - alias.descr.alias.add').action((data, session) => {
    const list = load(session.api.adapter.identity)
    if ((data.args[0] as string) in list) return 'alias.msg.alias.fail'

    const useful = Array.from(ctx[Symbols.command].values()).some(
      (command) => command.meta.root === data.args[1] || command.meta.alias.includes(data.args[1] as string)
    )
    if (!useful) return 'alias.msg.alias.fail.2'
    list[data.args[0] as string] = data.args.slice(1).join(' ')
    save(session.api.adapter.identity, list)
    return session.format('alias.msg.alias.add', [data.args[0]])
  })

  ctx.command('alias del <alias> - alias.descr.alias.del').action((data, session) => {
    const list = load(session.api.adapter.identity)
    if (!((data.args[0] as string) in list)) throw session.error('no_exists', { target: data.args[0] as string })
    delete list[data.args[0] as string]
    save(session.api.adapter.identity, list)
    return session.format('alias.msg.alias.del', [data.args[0]])
  })
}
