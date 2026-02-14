import {
  Command,
  CommandError,
  type Context,
  type LocaleType,
  MessageScope,
  ModuleError,
  Symbols,
  Tsu,
  TsuError,
  UserAccess
} from 'kotori-bot'

export const lang = [__dirname, '../locales']

export const config = Tsu.Object({
  alias: Tsu.String().optional().describe('Menu command alias'),
  keywords: Tsu.Array(Tsu.String()).default(['菜单', '功能']).describe('Menu command shortcuts'),
  content: Tsu.String().optional().describe('Custom menu command content')
})

export function main(ctx: Context, cfg: Tsu.infer<typeof config>) {
  ctx.on('before_command', (data) => {
    if (data.command.meta.options.some((val) => val.realname === 'help' || val.name === 'H')) return
    if ([' --help', ' -H', ' -h'].some((val) => data.raw.includes(val))) {
      data.cancel()
      ctx.emit(
        'on_message',
        Object.assign(data.session, {
          message: <text>{`${data.session.api.adapter.config.commandPrefix}help ${data.command.meta.root}`}</text>
        })
      )
      return
    }

    const quick = data.session.quick.bind(data.session)
    if (!(data.result instanceof CommandError)) {
      const { scope, access } = data.command.meta
      if (scope && scope !== 'all' && data.session.type !== scope) {
        quick('corei18n.template.scope')
        data.cancel()
      } else if (String(data.session.userId) !== String(data.session.api.adapter.config.master)) {
        if (access === UserAccess.ADMIN) {
          quick('corei18n.template.no_access_admin')
          data.cancel()
        } else if (
          access === UserAccess.MANGER &&
          (data.session.type === MessageScope.PRIVATE ||
            (data.session.type === MessageScope.GROUP && !['owner', 'admin'].includes(data.session.sender.role)))
        ) {
          quick('corei18n.template.no_access_manger')
          data.cancel()
        }
      }
      return
    }
    data.cancel()
    const { value } = data.result
    switch (value.type) {
      case 'arg_error':
        quick(['corei18n.template.args_error', [value.index, value.expected, value.reality]])
        break
      case 'arg_few':
        quick(['corei18n.template.args_few', [value.expected, value.reality]])
        break
      case 'arg_many':
        quick(['corei18n.template.args_many', [value.expected, value.reality]])
        break
      case 'option_error':
        quick(['corei18n.template.option_error', [value.target, value.expected, value.reality]])
        break
      case 'syntax':
        quick(['corei18n.template.syntax', [value.index, value.char]])
        break
      default:
    }
  })

  if (cfg.content) {
    const cmd = ctx
      .command('menu - core.descr.menu')
      .shortcut(cfg.keywords)
      .action((_, session) => session.format(String(cfg.content), { at: session.userId }))
    if (cfg.alias) cmd.alias(cfg.alias)
  }

  ctx.on('command', ({ result, session }) => {
    if (!(result instanceof CommandError)) return
    const { value } = result
    const quick = session.quick.bind(session)
    switch (value.type) {
      case 'unknown':
        quick(['corei18n.template.unknown', [value.input]])
        break
      case 'res_error':
        quick(['corei18n.template.res_error', [value.error.message]])
        break
      case 'num_error':
        quick('corei18n.template.num_error')
        break
      case 'no_access_manger':
        quick('corei18n.template.no_access_manger')
        break
      case 'no_access_admin':
        quick('corei18n.template.no_access_admin')
        break
      case 'disable':
        quick('corei18n.template.disable')
        break
      case 'exists':
        quick(['corei18n.template.exists', [value.target]])
        break
      case 'no_exists':
        quick(['corei18n.template.no_exists', [value.target]])
        break
      case 'error':
        ctx.emit('error', value.error instanceof Error ? value.error : new ModuleError(String(value.error)))
        if (value.error instanceof TsuError) {
          quick(['corei18n.template.res_error', [value.error.message]])
          return
        }
        if (value.error instanceof Error) {
          quick(['corei18n.template.error', [`${value.error.name} ${value.error.message}`]])
          return
        }
        if (typeof value.error === 'object') {
          quick(['corei18n.template.error', [JSON.stringify(value.error)]])
          return
        }
        quick(['corei18n.template.error', [String(value.error)]])
        break
      case 'data_error':
        quick([`corei18n.template.data_error.${typeof value.target === 'string' ? 'options' : 'args'}`, [value.target]])
        break
      default:
    }
  })

  ctx.command('core - core.descr.core').action((_, session) => {
    const { config, baseDir, options } = session.api.adapter.ctx
    const botsLength = Array.from(ctx[Symbols.bot].values())
      .map((set) => Array.from(set.values()).length)
      .reduce((a, b) => a + b, 0)

    return session.format('core.msg.core', {
      lang: config.global.lang,
      root: baseDir.root,
      mode: options.mode,
      modules: ctx[Symbols.modules] ? ctx[Symbols.modules].size : 0,
      services: ctx[Symbols.adapter].size,
      bots: botsLength,
      midwares: ctx[Symbols.midware].size,
      commands: ctx[Symbols.command].size,
      regexps: ctx[Symbols.regexp].size
    })
  })

  ctx.command('bot - core.descr.bot').action((_, session) => {
    const { identity, platform, selfId, config, status } = session.api.adapter
    return session.format('core.msg.bot', {
      identity,
      lang: config.lang,
      platform,
      self_id: selfId,
      create_time: session.i18n.time(status.createTime),
      last_msg_time: status.lastMsgTime ? session.i18n.time(status.lastMsgTime) : '',
      received_msg: status.receivedMsg,
      sent_msg: status.sentMsg,
      offline_times: status.offlineTimes
    })
  })

  ctx.command('bots - core.descr.bots').action((_, session) =>
    session.format('core.msg.bots', {
      list: Array.from(ctx[Symbols.bot].values())
        .map((bots) =>
          Array.from(bots.values())
            .map(({ adapter: { identity, platform, config, status } }) =>
              session.format('core.msg.bots.list', {
                identity,
                lang: config.lang,
                platform,
                status: status.value
              })
            )
            .join('')
        )
        .join('')
    })
  )

  ctx
    .command('about - core.descr.about')
    .alias('version')
    .shortcut(['小鸟', '小鳥', 'ことり', 'kotori', 'Kotori'])
    .hide()
    .action((_, session) => {
      const { version, license, coreVersion, loaderVersion } = session.api.adapter.ctx.meta
      return session.format('core.msg.about', {
        version,
        license,
        core_version: coreVersion,
        loader_version: loaderVersion,
        node_version: process.version
      })
    })

  ctx
    .command('locale <lang> - core.descr.locale')
    .option('G', 'global:boolean core.option.locale.global')
    .action(({ args: [lang], options: { global } }, session) => {
      const { adapter } = session.api
      if (!['en_US', 'ja_JP', 'zh_CN', 'zh_TW'].includes(lang)) return 'core.msg.locale.invalid'
      if (global) {
        adapter.ctx.root.config.global.lang = lang as LocaleType
        for (const apis of adapter.ctx[Symbols.bot].values()) {
          for (const { adapter } of apis.values()) adapter.config.lang = lang as LocaleType
        }
      } else {
        adapter.config.lang = lang as LocaleType
      }
      return session.format(`core.msg.locale${global ? '.global' : ''}`, { lang })
    })

  ctx.command('module [name] - core.descr.module').action(({ args: [name] }, session) => {
    let modulesList = Array.from(ctx[Symbols.modules].values())
    if (name) {
      modulesList = modulesList.filter(([{ pkg }]) => pkg.name.startsWith(name))
      if (modulesList.length === 0) return session.format('core.msg.module.not_found', { name })
    }
    return session.format('core.msg.module', {
      list: modulesList
        .map(([{ pkg }]) =>
          session.format('core.msg.module.list', {
            name: pkg.name,
            version: pkg.version,
            description: pkg.description
          })
        )
        .join('')
    })
  })

  ctx
    .command('restart - core.descr.restart')
    .access(UserAccess.ADMIN)
    .action(async (_, session) => {
      if (!ctx.options.isDaemon) {
        session.quick('core.msg.restart.not_daemon')
        return
      }
      await session.quick('core.msg.restart')
      setTimeout(() => process.exit(233), 1)
    })

  ctx.command('help [...command] - core.descr.help').action((data, session) => {
    const args = data.args.join(' ')
    const filterResult: Command['meta'][] = []

    for (const command of ctx[Symbols.command]) {
      if (command.meta.hide) continue
      if (!command.meta.root.startsWith(args) && !command.meta.alias.some((alias) => alias.startsWith(args))) continue
      filterResult.push(command.meta)
    }

    if (filterResult.length === 0) return 'core.msg.descr.fail'
    let commands = ''
    const short = filterResult.length === 1
    for (const cmd of filterResult) {
      const alias =
        cmd.alias.length > 0
          ? session.format('core.template.alias', {
            content: cmd.alias.join(session.i18n.locale('core.template.alias.delimiter'))
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
              defaultValue = session.format('core.template.default', { content: value.default as string })
            } else if (valueType === 'boolean') {
              defaultValue = session.format('core.template.default', { content: value.default ? 'true' : 'false' })
            }
            args += session.format(`core.template.arg.${value.optional ? 'optional' : 'required'}`, {
              name: value.rest ? `...${value.name}` : value.name,
              type: value.type === 'string' ? '' : session.format('core.template.arg.type', { content: value.type }),
              default: defaultValue
            })
          }
          if (!('realname' in value) || !('description' in value)) return
          options += session.format('core.template.option', {
            name: value.name,
            realname: value.realname,
            type: value.type === 'string' ? '' : session.format('core.template.arg.type', { content: value.type }),
            description: value.description
              ? session.format('core.template.description', { content: session.i18n.locale(value.description) })
              : ''
          })
        }
      }
      handle(cmd.args)
      if (short) handle(cmd.options)
      if (options) options = session.format('core.template.options', { content: options })
      commands += session.format(`core.msg.descr.command${short ? '2' : ''}`, {
        root: `${session.api.adapter.config.commandPrefix}${cmd.root}`,
        args,
        description: cmd.description
          ? session.format('core.template.description', { content: session.i18n.locale(cmd.description) })
          : '',
        options,
        help: cmd.help && short ? session.format('core.template.help', { content: session.i18n.locale(cmd.help) }) : '',
        alias: short ? alias : '',
        shortcuts: cmd.shortcut.length > 0 ? session.format('core.template.shortcuts', { content: cmd.shortcut.join(session.i18n.locale('core.template.alias.delimiter')) }) : ''
      })
    }
    return short ? commands : session.format('core.msg.help', { content: commands })
  })
}
