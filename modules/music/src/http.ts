import { Http, Tsu } from 'kotori-bot'
import config from './config'

const resSchema = Tsu.Object({
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

const http = new Http()

export default async function getData(name: string) {
  const res = resSchema.parse(
    await http.get(
      '/api/cloudsearch/pc',
      {
        s: name,
        type: 1,
        page: 0,
        limit: 10
      },
      config
    )
  )

  const songData = res.result.songs.map((song) => ({
    link: `http://music.163.com/#/song?id=${song.id}`,
    songId: song.id,
    title: song.name,
    authors: song.ar.map((artist) => artist.name),
    pic: `${song.al.picUrl}?param=300x300`,
    url: `http://music.163.com/song/media/outer/url?id=${song.id}.mp3`
  }))

  return songData
}
