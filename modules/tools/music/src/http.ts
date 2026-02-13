import Kotori, { Tsu } from 'kotori-bot'
import config from './config'

const resInfoSchema = Tsu.Object({
  result: Tsu.Object({
    songs: Tsu.Array(
      Tsu.Object({
        name: Tsu.String(),
        id: Tsu.Number(),
        ar: Tsu.Array(
          Tsu.Object({
            name: Tsu.String()
          })
        ),
        al: Tsu.Object({
          picUrl: Tsu.String()
        })
      })
    )
  })
})

const resLyricSchema = Tsu.Object({
  lrc: Tsu.Object({
    lyric: Tsu.String()
  })
})

export async function getMusicInfo(name: string) {
  return (resInfoSchema.parse(
    await Kotori.http.get(
      '/api/cloudsearch/pc',
      {
        s: name,
        type: 1,
        page: 0,
        limit: 10
      },
      config
    )
  )).result.songs.map((song) =>
  ({
    link: `http://music.163.com/#/song?id=${song.id}`,
    songId: song.id,
    title: song.name,
    authors: song.ar.map((artist) => artist.name),
    pic: `${song.al.picUrl}?param=300x300`,
  }))
}

export async function getMusicLyric(id: number) {
  return resLyricSchema.parse(await Kotori.http.get(
    `/api/song/lyric?id=${id}&lv=1`,
    {},
    config
  )).lrc.lyric
}
