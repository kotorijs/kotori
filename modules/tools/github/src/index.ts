import { type Context, Messages, Tsu } from 'kotori-bot'
import { parse } from 'node:url'

const HEAD_URL = 'https://opengraph.githubassets.com/c9f4179f4d560950b2355c82aa2b7750bffd945744f9b8ea3f93cc24779745a0'

const githubSchema = Tsu.Union(
  Tsu.Object({
    full_name: Tsu.String(),
    description: Tsu.String().default('corei18n.template.empty'),
    language: Tsu.String().default('corei18n.template.empty'),
    owner: Tsu.Object({ login: Tsu.String().default('corei18n.template.empty') }).default({
      login: 'corei18n.template.empty'
    }),
    created_at: Tsu.String(),
    updated_at: Tsu.String(),
    pushed_at: Tsu.String(),
    license: Tsu.Object({ name: Tsu.String().default('corei18n.template.empty') }).default({
      name: 'corei18n.template.empty'
    })
  }),
  Tsu.Object({})
)

export const lang = [__dirname, '../locales']

export function main(ctx: Context) {
  ctx.command('github <content> - github.descr.github').action(async ({ args: [content] }, session) => {
    // it is a repository
    if (content.split('/').length === 2) {
      const res = githubSchema.parse(await ctx.http.get(`https://api.github.com/repos/${content}`))
      if (!('full_name' in res)) {
        return session.format('github.msg.github.fail', { input: content })
      }
      session.quick([
        'github.msg.github',
        {
          name: res.full_name,
          description: res.description,
          language: res.language,
          author: res.owner?.login,
          create: res.created_at,
          update: res.updated_at,
          push: res.pushed_at,
          license: res.license ? res.license.name : 'BOT_RESULT.EMPTY'
        }
      ])
    }
    return Messages.image(`${HEAD_URL}/${content}`)
  })

  // * github pull request https://github.com/kotorijs/kotori/issues/3
  // * github repository github.com/kotorijs/kotori
  // * github issue http://github.com/kotorijs/kotori/pull/2
  // ! not match https://gitee.com/shit/shit
  // ! not match https://github.com/kotori
  // ! not match https://github.com/kotorijs/kotori/blob/
  // ! not match https://github.dev/kotorijs/kotori

  ctx.regexp(/(https?:\/\/)?github.com\/[\w-]+\/[\w]+\/?(\/(pull|issues)\/\d+)?$/, (_, session) => {
    const { pathname } = parse(session.message.toString())
    return Messages.image(`${HEAD_URL}${pathname}`)
  })
}
