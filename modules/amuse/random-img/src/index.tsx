import { type Context, Tsu } from 'kotori-bot'

const sexSchema = Tsu.Array(
  Tsu.Object({
    pid: Tsu.Number(),
    title: Tsu.String(),
    author: Tsu.String(),
    tags: Tsu.Array(Tsu.String()),
    url: Tsu.String(),
    r18: Tsu.Boolean()
  })
)

async function getSex(ctx: Context, tag?: string): Promise<undefined | Tsu.infer<typeof sexSchema>[number]> {
  try {
    const params: Record<string, string | number> = { r18: 'false', limit: 1 }
    if (tag) params.tag = tag
    const res = sexSchema.parse(await ctx.http.get('https://i.arimuraromi.com/api/seimg', params))
    if (!res || res.length === 0) return undefined
    const info = res[0]
    return info.r18 ? getSex(ctx, tag) : info
  } catch (err) {
    ctx.logger.error('Failed to get random seimg:', err)
    return undefined
  }
}

export const lang = [__dirname, '../locales']

export function main(ctx: Context) {
  ctx
    .command('sex [tags] - random_img.descr.sex')
    .shortcut(['来点色图', '涩图', '色图'])
    .action(async (data, session) => {
      session.quick('random_img.msg.sex.tips')
      const info = await getSex(ctx, data.args[0])
      if (!info) return session.format('random_img.msg.sex.fail', [data.args[0] ?? ''])

      session.send(<image src={info.url} />).then(({ messageId }) => setTimeout(() => session.api.deleteMsg(messageId), 1000 * 30))
      return (
        <format template={session.t`random_img.msg.sex`}>
          <text>{info.pid.toString()}</text>
          <text>{info.title}</text>
          <text>{info.author}</text>
          <text>{info.tags.join(' ')}</text>
        </format>
      )
    })

  ctx.command('bing - random_img.descr.bing').action(async (_, session) => {
    session.quick('random_img.msg.sex.tips')
    const text = String(await ctx.http.get('https://cn.bing.com/HPImageArchive.aspx?idx=0&n=1'))
    const result1 = text.match(/<url>(.*?)<\/url>/)
    const result2 = text.match(/<copyright>(.*?)<\/copyright>/)
    if (!result1 || !result2) return 'random_img.msg.fail'
    return (
      <format template={session.t`random_img.msg.bing`}>
        <image src={`https://cn.bing.com${result1[1]}`} />
        <text>{result2[1]}</text>
      </format>
    )
  })

  ctx.command('earth - random_img.descr.earth').action((_, session) => {
    session.quick('random_img.msg.sex.tips')
    return <image src="https://img.nsmc.org.cn/CLOUDIMAGE/FY4A/MTCC/FY4A_DISK.jpg" />
  })

  ctx.command('china - random_img.descr.china').action((_, session) => {
    session.quick('random_img.msg.sex.tips')
    return <image src="https://img.nsmc.org.cn/CLOUDIMAGE/FY4A/MTCC/FY4A_CHINA.jpg" />
  })
}
