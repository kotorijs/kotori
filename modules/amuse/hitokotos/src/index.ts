import { type Context, type MessageQuickReal, Tsu } from 'kotori-bot'

const hitokotoSchema = Tsu.Object({
  data: Tsu.Object({
    msg: Tsu.String(),
    from: Tsu.String().optional(),
    likes: Tsu.Number(),
    type: Tsu.String()
  })
})

const hitokotosSchema = Tsu.Object({
  data: Tsu.Object({
    msg: Tsu.String()
  })
})

export const lang = [__dirname, '../locales']

export function main(ctx: Context) {
  ctx
    .command('hitokotos - hitokotos.descr.hitokotos.help')
    .action(
      () =>
        '随机语录' +
        '\n一言 一言2' +
        '\n诗词 情话' +
        '\n骚话 笑话' +
        '\n人生语录 社会语录' +
        '\n网抑云 毒鸡汤' +
        '\n舔狗语录 爱情语录' +
        '\n温柔语录 个性签名' +
        '\n经典语录 英汉语录'
    )

  ctx
    .command('hitokoto - hitokotos.descr.hitokoto.help')
    .shortcut('一言')
    .action(async (_, s) => {
      const res = await ctx.http.get('https://api.hotaru.icu/ial/hitokoto/v2/')
      if (!hitokotoSchema.check(res)) return s.format('corei18n.template.res_error', { res: res as string })
      return s.format('hitokotos.msg.hitokoto', { ...res.data, from: res.data.from ? `——${res.data.from}` : '' })
    })

  const hitokotoT = async (msg: number): Promise<MessageQuickReal> => {
    const res = await ctx.http.get('https://api.hotaru.icu/api/words', { msg })
    if (!hitokotosSchema.check(res)) return ['corei18n.template.res_error', { res: res as string }]
    return ['hitokotos.msg.list', { content: res.data.msg }]
  }

  ctx.regexp(/^一言2$/, () => hitokotoT(1))
  ctx.regexp(/^骚话$/, () => hitokotoT(2))
  ctx.regexp(/^情话$/, () => hitokotoT(3))
  ctx.regexp(/^人生语录$/, () => hitokotoT(4))
  ctx.regexp(/^社会语录$/, () => hitokotoT(5))
  ctx.regexp(/^毒鸡汤$/, () => hitokotoT(6))
  ctx.regexp(/^笑话$/, () => hitokotoT(7))
  ctx.regexp(/^网抑云$/, () => hitokotoT(8))
  ctx.regexp(/^温柔语录$/, () => hitokotoT(9))
  ctx.regexp(/^舔狗语录$/, () => hitokotoT(10))
  ctx.regexp(/^爱情语录$/, () => hitokotoT(11))
  ctx.regexp(/^个性签名$/, () => hitokotoT(12))
  ctx.regexp(/^经典语录$/, () => hitokotoT(14))
  ctx.regexp(/^英汉语录$/, () => hitokotoT(15))
  ctx.regexp(/^诗词$/, () => hitokotoT(16))
}

export default main
