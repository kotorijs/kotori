/*
 * @Author: hotaru biyuehuya@gmail.com
 * @Blog: https://hotaru.icu
 * @Date: 2023-07-11 14:18:27
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2024-08-07 18:37:11
 */

import { type Command, type Context, Symbols, Tsu } from 'kotori-bot'

export const config = Tsu.Object({
  alias: Tsu.String().optional().describe('Menu command alias'),
  keywords: Tsu.Array(Tsu.String()).default(['菜单', '功能']).describe('Menu command shortcuts'),
  content: Tsu.String().optional().describe('Custom menu command content')
})

export const lang = [__dirname, '../locales']

export function main(ctx: Context, cfg: Tsu.infer<typeof config>) {
  if (cfg.content) {
    const cmd = ctx
      .command('menu - helper.descr.menu')
      .shortcut(cfg.keywords)
      .action((_, session) => session.format(String(cfg.content), { at: session.userId }))
    if (cfg.alias) cmd.alias(cfg.alias)
  }

  ctx.command('help [...command] - helper.descr.help').action((data, session) => {
    const args = data.args.join(' ')
    const filterResult: Command['meta'][] = []

    for (const command of ctx[Symbols.command]) {
      if (command.meta.hide) continue
      if (!command.meta.root.startsWith(args) && !command.meta.alias.some((alias) => alias.startsWith(args))) continue
      filterResult.push(command.meta)
    }

    if (filterResult.length <= 0) return 'helper.msg.descr.fail'
    let commands = ''
    for (const cmd of filterResult) {
      const alias =
        cmd.alias.length > 0
          ? session.format('helper.template.alias', {
              content: cmd.alias.join(session.i18n.locale('helper.template.alias.delimiter'))
            })
          : ''
      let args = ''
      let options = ''
      const handle = (values: Command['meta']['args'] | Command['meta']['options']) => {
        for (const value of values) {
          let defaultValue = ''
          if ('rest' in value) {
            const valueType = typeof value.default
            if (valueType === 'string' || valueType === 'number') {
              defaultValue = session.format('helper.template.default', { content: value.default as string })
            } else if (valueType === 'boolean') {
              defaultValue = session.format('helper.template.default', { content: value.default ? 'true' : 'false' })
            }
            args += session.format(`helper.template.arg.${value.optional ? 'optional' : 'required'}`, {
              name: value.rest ? `...${value.name}` : value.name,
              type: value.type === 'string' ? '' : session.format('helper.template.arg.type', { content: value.type }),
              default: defaultValue
            })
          }
          if (!('realname' in value) || !('description' in value)) return
          options += session.format('helper.template.option', {
            name: value.name,
            realname: value.realname,
            type: value.type === 'string' ? '' : session.format('helper.template.arg.type', { content: value.type }),
            description: value.description
              ? session.format('helper.template.description', { content: session.i18n.locale(value.description) })
              : ''
          })
        }
      }
      handle(cmd.args)
      handle(cmd.options)
      if (options) options = session.format('helper.template.options', { content: options })
      commands += session.format('helper.msg.descr.command', {
        root: `${session.api.adapter.config.commandPrefix}${cmd.root}`,
        args,
        description: cmd.description
          ? session.format('helper.template.description', { content: session.i18n.locale(cmd.description) })
          : '',
        options,
        help: cmd.help ? session.format('helper.template.help', { content: session.i18n.locale(cmd.help) }) : '',
        alias
      })
    }
    return session.format('helper.msg.help', { content: commands })
  })
}

export default main
