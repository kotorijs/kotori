import { type Context, Tsu, Messages, type SessionMsg } from 'kotori-bot'

const biliSchema = Tsu.Object({
  data: Tsu.Object({
    View: Tsu.Object({
      bvid: Tsu.String(),
      aid: Tsu.Number(),
      tname: Tsu.String(),
      title: Tsu.String(),
      pic: Tsu.String(),
      desc: Tsu.String(),
      ctime: Tsu.Number(),
      owner: Tsu.Object({
        name: Tsu.String(),
        mid: Tsu.Number()
      }),
      stat: Tsu.Object({
        view: Tsu.Any(),
        reply: Tsu.Any(),
        favorite: Tsu.Any(),
        coin: Tsu.Any(),
        share: Tsu.Any(),
        like: Tsu.Any()
      })
    })
  }).optional()
})

const biliArSchema = Tsu.Object({
  data: Tsu.Object({
    mid: Tsu.Number(),
    author_name: Tsu.String(),
    title: Tsu.String(),
    origin_image_urls: Tsu.String().optional(),
    stats: Tsu.Object({
      view: Tsu.Any(),
      reply: Tsu.Any(),
      favorite: Tsu.Any(),
      coin: Tsu.Any(),
      share: Tsu.Any(),
      like: Tsu.Any()
    })
  }).optional()
})

// const bilier1Schema = Tsu.Object({
//   data: Tsu.Object({
//     following: Tsu.Number(),
//     follower: Tsu.Number()
//   }).optional()
// })

// const bilier2Schema = Tsu.Object({
//   data: Tsu.Object({
//     name: Tsu.String(),
//     level: Tsu.Number(),
//     sex: Tsu.String(),
//     description: Tsu.String(),
//     avatar: Tsu.String()
//   }).optional()
// })

export const lang = [__dirname, '../locales']

export function main(ctx: Context) {
  async function getVideo(id: string, session: SessionMsg) {
    const params = id.startsWith('av') ? { avid: id } : { bvid: id }
    const res = biliSchema.parse(
      await ctx.http.get('https://api.bilibili.com/x/web-interface/view/detail', params as { bvid: string })
    )
    if (!res.data) return '没有找到相关视频'
    const { View: v } = res.data
    session.quick([
      'BV 号：{0}\nAV 号：{1}\n分区名称：{2}\n视频标题：{3}\n视频简介：{4}\n发布时间：{5}\n播放量：{6}\n点赞量：{7}\n收藏量：{8}\n投币量：{9}\n评论量：{10}\n分享量：{11}\nUP 主名字：{12}\nUP 主 UID：{13}',
      [
        v.bvid,
        v.aid,
        v.tname,
        v.title,
        v.desc,
        new Date(v.ctime * 1000).toLocaleString(),
        v.stat.view,
        v.stat.like,
        v.stat.favorite,
        v.stat.coin,
        v.stat.reply,
        v.stat.share,
        v.owner.name,
        v.owner.mid
      ]
    ])
    return Messages.image(v.pic)
  }

  ctx.command('bili <id> - 查询 B站 视频信息').action(async ({ args: [id] }, session) => {
    return getVideo(id, session)
  })

  ctx.command('bili-ar <cid> - 查询 B站 专栏信息').action(async ({ args: [id] }, session) => {
    const params = { id: id.startsWith('cv') ? id.slice(2) : id }
    const res = biliArSchema.parse(await ctx.http.get('https://api.bilibili.com/x/article/viewinfo', params))
    if (!res.data) return '没有找到相关文章'
    const { data: d } = res
    session.quick([
      'CV 号：{0}\n专栏标题：{1}\nUP 主名字：{2}\n播放量：{3}\n点赞量：{4}\n收藏量：{5}\n投币量：{6}\n评论量：{7}\n分享量：{8}',
      [
        d.mid,
        d.title,
        d.author_name,
        d.stats.view,
        d.stats.like,
        d.stats.favorite,
        d.stats.coin,
        d.stats.reply,
        d.stats.share
      ]
    ])
    return d.origin_image_urls ? Messages.image(d.origin_image_urls) : ''
  })

  ctx.regexp(/^(bv|BV)([A-Z,a-z,0-9]){8,12}$/, (result, session) => {
    session.quick(getVideo(result[0], session))
  })

  // ctx.command('bilier <uid> - bilibili.descr.bilier').action(async (data, session) => {
  //   const res = Object.assign(
  //     bilier1Schema.parse(await ctx.http.get('https://tenapi.cn/bilibilifo/', { uid: data.args[0] })).data || {},
  //     bilier2Schema.parse(await ctx.http.get('https://tenapi.cn/bilibili/', { uid: data.args[0] })).data
  //   )
  //   if (!res) return ['bilibili.msg.bilier.fail', { input: data.args[0] }]
  //   return [
  //     'bilibili.msg.bilier',
  //     {
  //       ...res,
  //       image: session.el.image(res.avatar)
  //     }
  //   ]
  // })
}
