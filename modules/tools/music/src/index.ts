import { type Context, Messages } from 'kotori-bot'
import getData from './http'

const MAX_LIST = 10

export const lang = [__dirname, '../locales']

export const inject = ['cache']

export function main(ctx: Context) {
  ctx
    .command('music <...name> - music.descr.music')
    .option('O', 'order:number music.option.music.order')
    .action(async ({ args, options: { order } }, session) => {
      const name = args.join(' ')
      if (!name) return session.quick(['music.msg.music.fail', [name]])
      const res =
        ctx.cache.get<ReturnType<typeof getData> extends Promise<infer T> ? T : never>(name) ?? (await getData(name))
      ctx.cache.set(name, res)

      if (order === 0) {
        let list = ''
        for (let init = 0; init < (res.length > MAX_LIST ? MAX_LIST : res.length); init += 1) {
          const song = res[init]
          list += session.format('music.msg.music.list', [init + 1, song.title ?? '', song.authors[0] ?? ''])
        }
        return list
      }

      const song = res[(order ?? 1) - 1]
      if (!song) throw session.error('num_error')

      if (session.api.adapter.platform === 'onebot') session.send(`[CQ:music,type=163,id=${song.songId}]`)

      return session.format('music.msg.music', [
        song.songId,
        song.title,
        song.authors[0],
        song.url,
        Messages.image(song.pic)
      ])
    })
    .help('music.help.music')
}
