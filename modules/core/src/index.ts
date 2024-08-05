/*
 * @Author: hotaru biyuehuya@gmail.com
 * @Blog: https://hotaru.icu
 * @Date: 2023-07-11 14:18:27
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2024-08-03 10:59:04
 */

import {
  UserAccess,
  CommandError,
  type Context,
  MessageScope,
  TsuError,
  type LocaleType,
  Symbols,
  FilterTestList,
  ModuleError
} from 'kotori-bot'

export const lang = [__dirname, '../locales']

export function main(ctx: Context) {
  ctx.on('before_command', (data) => {
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

  ctx
    .filter({
      test: FilterTestList.USER_ID,
      operator: '==',
      value: '114514'
    })
    .command('core - core.descr.core')
    .action((_, session) => {
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
      const { version, license } = session.api.adapter.ctx.meta
      return session.format('core.msg.about', { version, license, node_version: process.version })
    })

  ctx
    .command('locale <lang> - core.descr.locale')
    .option('G', 'global:boolean - core.option.locale.global')
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
}
