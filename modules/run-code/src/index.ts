import { Tsu, type Context } from 'kotori-bot'
import JsBox from './class/jsBox'
import LuaBox from './class/luaBox'

export const lang = [__dirname, '../locales']

export const config = Tsu.Object({
  timeout: Tsu.Number().positive().describe('Allow max time of code running').default(5000)
})

type Config = Tsu.infer<typeof config>

export function main(ctx: Context, config: Config) {
  ctx.command('runjs - runcode.descr.runjs').action(async (_, session) => {
    const code = await session.prompt('runcode.msg.runjs.prompt')
    const box = new JsBox(code.toString())
    const result = box.run(config.timeout)
    return result === false ? 'runcode.msg.runjs.timeout' : session.format('runcode.msg.runjs.info', [result])
  })

  ctx.command('runlua - runcode.descr.runlua').action(async (_, session) => {
    const code = await session.prompt('runcode.msg.runlua.prompt')
    const box = new LuaBox(code.toString())
    const result = box.run()
    return session.format('runcode.msg.runjs.info', [result])
  })
}
