import { type Context, MessageScope, UserAccess } from 'kotori-bot'

export const lang = [__dirname, '../locales']

export const inject = ['file']

type Data = Record<string, string[]>

export function main(ctx: Context) {
  const load = (bot: string) => ctx.file.load<Data>(`${bot}.json`, 'json', {})
  const save = (bot: string, data: Data) => ctx.file.save(`${bot}.json`, data)

  ctx.on('before_command', (d) => {
    if (d.session.type !== MessageScope.GROUP || !d.session.groupId) return
    const list = load(d.session.api.adapter.identity)
    if (!(d.session.groupId in list)) return
    if (!list[d.session.groupId].includes(d.session.userId)) return
    if (d.session.type === MessageScope.GROUP) d.session.sender.role = 'admin'
  })

  ctx
    .command('access query - access.descr.access.query')
    .scope(MessageScope.GROUP)
    .access(UserAccess.ADMIN)
    .action((_, session) => {
      const list = (load(session.api.adapter.identity)[session.groupId] ?? [])
        .map((el) => session.format('access.msg.access.list', [el]))
        .join('')
      return session.format('access.msg.access.query', [list])
    })

  ctx
    .command('access add <userId> - access.descr.access.add')
    .scope(MessageScope.GROUP)
    .access(UserAccess.ADMIN)
    .action((data, session) => {
      const list = load(session.api.adapter.identity)
      const { groupId } = session
      list[groupId] = list[groupId] ?? []
      if (list[groupId].includes(data.args[0] as string)) {
        throw session.error('exists', { target: data.args[0] as string })
      }
      list[groupId].push(data.args[0] as string)
      save(session.api.adapter.identity, list)
      return session.format('access.msg.access.add', [data.args[0]])
    })

  ctx
    .command('access del <userId> - access.descr.access.del')
    .scope(MessageScope.GROUP)
    .access(UserAccess.ADMIN)
    .action((data, session) => {
      const list = load(session.api.adapter.identity)
      const { groupId } = session
      list[groupId] = list[groupId] ?? []
      if (!list[groupId].includes(data.args[0] as string)) {
        throw session.error('no_exists', { target: data.args[0] as string })
      }
      list[groupId] = list[groupId].filter((el) => el !== data.args[0])
      save(session.api.adapter.identity, list)
      return session.format('access.msg.access.del', [data.args[0]])
    })
}
