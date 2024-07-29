import { Context } from 'kotori-bot'
import JsBox from './class/jsbox'
import LuaBox from './class/luabox'

export const lang = [__dirname, '../locales']

// TODO: update
export function main(ctx: Context) {
  ctx.command('runjs - runcode.descr.runjs').action(async (_, session) => {
    const code = await session.prompt('runcode.msg.runjs.prompt')
    const box = new JsBox(code)
    const result = await box.run()
    return ['runcode.msg.runjs.info', [result]]
  })

  ctx.command('runlua - runcode.descr.runlua').action(async (_, session) => {
    const code = await session.prompt('runcode.msg.runlua.prompt')
    const box = new LuaBox(code)
    const result = await box.run()
    return ['runcode.msg.runlua.info', [result]]
  })
}
