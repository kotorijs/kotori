import { Tsu, type Context, Messages } from 'kotori-bot'

const sexSchema = Tsu.Object({
  data: Tsu.Array(
    Tsu.Object({
      pid: Tsu.Number(),
      title: Tsu.String(),
      author: Tsu.String(),
      tags: Tsu.Array(Tsu.String()),
      url: Tsu.String()
    })
  ).optional()
})

// const sexhSchema = Tsu.Object({
//   data: Tsu.Object({
//     url: Tsu.String(),
//     tag: Tsu.Array(Tsu.String())
//   }).optional()
// })

export const lang = [__dirname, '../locales']

export function main(ctx: Context) {
  ctx
    .command('sex [tags] - random_img.descr.sex')
    .shortcut(['来点色图', '涩图', '色图'])
    .action(async (data, session) => {
      session.quick('random_img.msg.sex.tips')
      const res = sexSchema.parse(
        await ctx.http.get('https://hotaru.icu/api/seimg/v2/', { tag: data.args[0] || '', r18: 0 })
      )
      if (!res.data) return session.format('random_img.msg.sex.fail', [data.args[0]])

      const info = res.data[0]
      session.quick(['random_img.msg.sex', [info.pid, info.title, info.author, info.tags.join(' ')]])
      return Messages.image(info.url)
    })

  // ctx.command('sexh [tags] - random_img.descr.sexh').action(async (data, session) => {
  //   session.quick('random_img.msg.sexh.tips')
  //   const res = sexhSchema.parse(await ctx.http.get('https://hotaru.icu/api/huimg/'))
  //   if (!res.data) return session.format('random_img.msg.sexh.fail', [data.args[0]])

  //   const info = res.data
  //   return session.format('random_img.msg.sexh', [info.tag.join(' '), Messages.image(info.url)])
  // })

  ctx.command('bing - random_img.descr.bing').action(async (_, session) => {
    session.quick('random_img.msg.sex.tips')
    const text = String(await ctx.http.get('https://cn.bing.com/HPImageArchive.aspx?idx=0&n=1'))
    const result1 = text.match(/<url>(.*?)<\/url>/)
    const result2 = text.match(/<copyright>(.*?)<\/copyright>/)
    if (!result1 || !result2) return 'random_img.msg.fail'
    return session.format('random_img.msg.bing', [Messages.image(`https://cn.bing.com${result1[1]}`), result2[1]])
  })

  ctx.command('day - random_img.descr.day').action((_, session) => {
    session.quick('random_img.msg.sex.tips')
    return Messages.image('https://api.hotaru.icu/api/60s?apikey=1c42abefdb5f7cc463dbc88e82d561b1&area=日本神户市')
  })

  ctx.command('earth - random_img.descr.earth').action((_, session) => {
    session.quick('random_img.msg.sex.tips')
    return Messages.image('https://img.nsmc.org.cn/CLOUDIMAGE/FY4A/MTCC/FY4A_DISK.jpg')
  })

  ctx.command('china - random_img.descr.china').action((_, session) => {
    session.quick('random_img.msg.sex.tips')
    return Messages.image('https://img.nsmc.org.cn/CLOUDIMAGE/FY4A/MTCC/FY4A_CHINA.jpg')
  })

  ctx.command('beauty - random_img.descr.beauty').action((_, session) => {
    session.quick('random_img.msg.sex.tips')
    return Messages.image('https://api.hotaru.icu/api/beautyimg')
  })
}
