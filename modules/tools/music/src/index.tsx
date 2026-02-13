import { type Context } from 'kotori-bot'
import { getMusicInfo, getMusicLyric } from './http'

const MAX_LIST = 10

export const lang = [__dirname, '../locales']

export const inject = ['cache']

export function main(ctx: Context) {
  ctx
    .command('music <...name> - music.descr.music')
    .option('O', 'order:number music.option.music.order')
    .option('L', 'lyric:boolean music.option.music.lyric')
    .action(async ({ args, options: { order, lyric } }, session) => {
      const name = args.join(' ')
      if (!name) return session.quick(['music.msg.music.fail', [name]])
      const res =
        ctx.cache.get<ReturnType<typeof getMusicInfo> extends Promise<infer T> ? T : never>(name) ?? (await getMusicInfo(name))
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

      if (lyric) return (await getMusicLyric(song.songId)).trim()

      return <format template={session.t`music.msg.music`}>
        <text>{song.songId}</text>
        <text>{song.title}</text>
        <text>{song.authors[0]}</text>
        <text>{await fetch(`http://music.163.com/song/media/outer/url?id=${song.songId}.mp3`).then(res => res.url.endsWith('/404') ? '' : res.url)}</text>
        <image src={song.pic} />
      </format>
    })
    .help('music.help.music')
}
