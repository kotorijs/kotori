import os from 'node:os'
import {
  type Context,
  Service,
  Symbols,
  type Transport,
  Tsu,
  loadConfig,
  PLUGIN_PREFIX,
  adapterConfigSchemaFactory,
  filterOptionSchema
} from 'kotori-bot'
import { getStatusStats } from '../utils/common'
import type { AccountData, BotStats, BotStatsDay, CommandSettings, LoginStats } from '../types'
import WebuiTransport from '../utils/transport'
import { parse, resolve } from 'node:path'
import { createHash, randomUUID } from 'node:crypto'
import observer from '../utils/observer'
import createAutoSave from '../utils/autoSave'

function handlePluginName(scope: string, name?: string) {
  return `${scope.startsWith('@') && scope !== '@kotori-bot' ? `${scope.slice(1)}/` : ''}${(name ?? scope).replace(PLUGIN_PREFIX, '')}`
}
function generateToken() {
  return randomUUID().replaceAll('-', '')
}

function generateVerifyHash(username: string, password: string, salt: string) {
  return createHash('sha256').update(`${username}${password}${salt}`).digest('hex')
}

function getToday() {
  return new Date(new Date().toLocaleDateString()).getTime()
}

export const config = Tsu.Object({
  interval: Tsu.Number().positive().default(5).describe('Status stat sent interval')
})

export class Webui extends Service<Tsu.infer<typeof config>> {
  public constructor(ctx: Context, cfg: Tsu.infer<typeof config>) {
    super(ctx, cfg, 'webui')
  }

  public async start() {
    // Add webui transport to logger
    const logger = this.ctx.get('logger') as { options: { transports: Transport[] } }
    logger.options.transports.push(new (WebuiTransport(this.ctx))({}))

    // Initialize database and update command settings
    await this.ctx.db.get<LoginStats>('login_stats', { success: 0, failed: 0 })
    await this.ctx.db.get<AccountData>('account_data', { hash: '', salt: '' })
    await this.ctx.db.get<BotStats>('bot_stats', {})
    const settings = await this.ctx.db.get<CommandSettings>('command_settings', {})
    if (Object.keys(settings).length === 0) {
      for await (const command of this.ctx[Symbols.command].values()) {
        const { hide, shortcut, alias, scope, access } = command.meta
        settings[command.meta.root] = { hide, shortcut, alias, scope, access }
      }
    } else {
      for await (const [root, setting] of Object.entries(settings)) {
        const command = Array.from(this.ctx[Symbols.command]).find((command) => command.meta.root === root)
        if (command) {
          ;(command as { meta: object }).meta = { ...command.meta, ...setting }
        } else {
          delete settings[root]
        }
      }
    }
    await this.ctx.db.put('command_settings', settings)

    // Listen data change
    ;(this.ctx as { config: object }).config = createAutoSave(
      this.ctx.config,
      resolve(this.ctx.baseDir.config),
      parse(this.ctx.baseDir.config).ext.slice(1) as 'json',
      this.ctx.config
    )
    for await (const bots of this.ctx[Symbols.bot].values()) {
      for await (const { adapter } of bots) {
        const { identity } = adapter
        const botStats = await this.ctx.db.get<BotStats>('bot_stats')
        if (botStats[identity]) {
          ;(adapter as { status: object }).status = {
            ...botStats[identity],
            createTime: new Date(botStats[identity].createTime),
            lastMsgTime: botStats[identity].lastMsgTime ? new Date(botStats[identity].lastMsgTime as number) : null,
            value: adapter.status.value
          }
        } else {
          botStats[identity] = {
            ...adapter.status,
            createTime: new Date(adapter.status.createTime).getTime(),
            lastMsgTime: adapter.status.lastMsgTime ? new Date(adapter.status.lastMsgTime).getTime() : null
          }
        }
        await this.ctx.db.put('bot_stats', botStats)
        ;(adapter as { status: object }).status = observer(adapter.status, async (_, prop) => {
          const botStats = await this.ctx.db.get<BotStats>('bot_stats')
          const botStatsToday = await this.ctx.db.get<BotStatsDay>(`bot_stats:${getToday()}`, {})
          const isNumberProp = ['offlineTimes', 'receivedMsg', 'sentMsg'].includes(prop)

          if (botStats[identity] && isNumberProp) {
            botStats[identity][prop as 'sentMsg'] += 1
          } else {
            botStats[identity] = {
              ...adapter.status,
              createTime: new Date(adapter.status.createTime).getTime(),
              lastMsgTime: adapter.status.lastMsgTime ? new Date(adapter.status.lastMsgTime).getTime() : null
            }
          }
          if (botStatsToday[identity] && isNumberProp) {
            botStats[identity][prop as 'sentMsg'] += 1
          } else if (!botStatsToday[identity]) {
            botStatsToday[identity] = { sentMsg: 0, receivedMsg: 0, offlineTimes: 0 }
          }

          await this.ctx.db.put('bot_stats', botStats)
          await this.ctx.db.put(`bot_stats:${getToday()}`, botStatsToday)
        })
      }
    }
  }

  public setVerifyHash(username: string, password: string) {
    const salt = generateToken()
    this.ctx.db.put<AccountData>('account_data', {
      salt,
      hash: generateVerifyHash(username, password, salt)
    })
  }

  public getVerifyHash() {
    return this.ctx.db.get<AccountData>('account_data')
  }

  public checkToken(authorization?: string) {
    return (
      !!authorization && (this.ctx.cache.get<string[]>('tokens') ?? []).includes(authorization.replace('Bearer ', ''))
    )
  }

  public async accountLogin(username: string, password: string) {
    const loginStats = await this.ctx.db.get<LoginStats>('login_stats')
    const { salt, hash } = await this.getVerifyHash()

    if (generateVerifyHash(username, password, salt) !== hash) {
      loginStats.failed += 1
      await this.ctx.db.put('login_stats', loginStats)
      return undefined
    }

    loginStats.success += 1
    await this.ctx.db.put('login_stats', loginStats)
    const list = this.ctx.cache.get<string[]>('tokens') ?? []
    const token = generateToken()
    list.push(token)
    this.ctx.cache.set('tokens', list)
    return token
  }

  public accountLogout(authorization: string) {
    const list = this.ctx.cache.get<string[]>('tokens') ?? []
    const token = authorization?.replace('Bearer ', '')
    this.ctx.cache.set(
      'tokens',
      list.filter((t) => t !== token)
    )
  }

  public dataModules(scope?: string, name?: string) {
    const modulesData = Array.from(this.ctx[Symbols.modules].values()).map(([moduleMeta]) => moduleMeta.pkg)
    if (!scope) return modulesData
    const moduleName = name ? `${scope}/${name}` : scope
    return modulesData.find((module) => module.name === moduleName) as object | undefined
  }

  public dataBots(name?: string) {
    const botsData = []
    for (const bot of this.ctx[Symbols.bot].values()) {
      for (const api of bot) {
        botsData.push({
          status: api.adapter.status,
          platform: api.adapter.platform,
          identity: api.adapter.identity,
          id: String(api.adapter.selfId),
          lang: api.adapter.config.lang
        })
      }
    }
    if (!name) return botsData
    return botsData.find((bot) => bot.identity === name) as object | undefined
  }

  public async dataStats() {
    function calcBotStatMsg(data: BotStatsDay) {
      return Object.values(data).reduce(
        (acc, cur) => ({
          received: acc.received + cur.receivedMsg,
          sent: acc.sent + cur.sentMsg
        }),
        { received: 0, sent: 0 }
      )
    }

    const botsStatus = (this.dataBots() as { status: { value: string } }[]).map((bot) => bot.status.value === 'online')
    const { success: loginSuccess, failed: loginFailed } = await this.ctx.db.get<LoginStats>('login_stats')
    const botStats = calcBotStatMsg((await this.ctx.db.get<BotStats>('bot_stats')) ?? {})
    const botStatDays: Record<'received' | 'sent', number[]> = { received: [], sent: [] }
    const ONE_DAY = new Date('2013-07-20').getTime() - new Date('2013-07-19').getTime()

    for await (const day of [0, 1, 2, 3, 4, 5, 6]) {
      const key = `bot_stats:${getToday() - day * ONE_DAY}`
      const { received, sent } = calcBotStatMsg((await this.ctx.db.get<BotStatsDay>(key)) ?? {})
      botStatDays.received.push(received || 0)
      botStatDays.sent.push(sent || 0)
    }

    return {
      chats: botStatDays,
      count: {
        midwares: this.ctx[Symbols.midware].size,
        commands: this.ctx[Symbols.command].size,
        regexps: this.ctx[Symbols.regexp].size,
        bots: this.ctx[Symbols.bot].size,
        adapters: this.ctx[Symbols.adapter].size,
        modules: this.ctx[Symbols.modules].size
      },
      system: {
        type: os.type(),
        arch: os.arch(),
        uptime: os.uptime(),
        hostname: os.hostname(),
        homedir: os.homedir(),
        node: process.version
      },
      info: {
        message: `${botStats.received}:${botStats.sent}`,
        bots: `${botsStatus.filter((status) => status).length}/${botsStatus.length}`,
        login: `${loginSuccess}:${loginFailed}`,
        memory: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`
      }
    }
  }

  public dataStatus() {
    return {
      ...getStatusStats(),
      mode: this.ctx.options.mode,
      main: this.ctx.meta.version,
      core: this.ctx.meta.coreVersion,
      loader: this.ctx.meta.loaderVersion
    }
  }

  public dataAvatar(scope?: string, name?: string) {
    const AVATAR_COLOR_LIST = [
      ['#64FFDA', '#00B0FF', '#FFFFFF'], // default
      ['#FFD700', '#FF8C00', '#000000'], // gold
      ['#EF9A9A', '#F44336', '#FFFFFF'], // red
      ['#03A9F4', '#0D47A1', '#212121'], // blue
      ['#A5D6A7', '#4CAF50', '#FFFFFF'], // green
      ['#CE93D8', '#9C27B0', '#FFFFFF'], // purple
      ['#BCAAA4', '#795548', '#FFFFFF'], // shit
      ['#FFC0CB', '#FF69B4', '#FFFFFF'], // pink
      ['#78909C', '#546E7A', '#FFFFFF'] // grey
    ]

    const DEFAULT_NAME = 'Kotori Plugin'
    const DEFAULT_COLOR = AVATAR_COLOR_LIST[0]
    const DEFAULT_FONT_SIZE = 75

    /* Handle plugin name */
    let pluginName = DEFAULT_NAME
    if (scope) {
      pluginName = name ?? scope
      if (pluginName.startsWith('kotori-plugin-')) pluginName = pluginName.slice(14)
      pluginName = pluginName
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    }

    /* Get index of avatar color based on plugin name */
    const hash = pluginName.split('').reduce((hash, char) => hash * 31 + char.charCodeAt(0), 0)
    const index = hash % 9
    const color = AVATAR_COLOR_LIST[index >= 0 ? index : index + 9]

    /* Complete font size */
    const fontSize = Math.ceil(108 * (9 / pluginName.length))

    /* Load avatar image and replace data */
    let imageData = loadConfig(resolve(__dirname, '../../assets/avatar.svg'), 'text')
    imageData = imageData.replace(DEFAULT_COLOR[0], color[0])
    imageData = imageData.replace(DEFAULT_COLOR[1], color[1])
    imageData = imageData.replace(DEFAULT_COLOR[2], color[2])
    imageData = imageData.replace(DEFAULT_NAME, pluginName)
    imageData = imageData.replace(DEFAULT_FONT_SIZE.toString(), fontSize.toString())

    /* Send image data */
    return imageData
  }

  public configPluginsGet(scope?: string, name?: string) {
    const pluginsConfig = Array.from(this.ctx[Symbols.modules].entries()).map(([name, [, , schema]]) => ({
      name,
      origin: this.ctx.config.plugin[handlePluginName(name.split('/')[0], name.split('/')[1])],
      schema: Tsu.Intersection(filterOptionSchema, schema ?? Tsu.Object()).schema()
    }))

    if (!scope) return pluginsConfig
    const pluginName = name ? `${scope}/${name}` : scope
    return pluginsConfig.find(({ name }) => pluginName === name)
  }

  public configPluginUpdate(data: object, scope: string, name?: string) {
    const pluginName = handlePluginName(scope, name)
    const pluginConfig = this.ctx.config.plugin[pluginName]
    if (!pluginConfig) return false
    for (const key in data) {
      if (key in pluginConfig) pluginConfig[key as keyof typeof pluginConfig] = data[key as keyof typeof data]
    }
    return true
  }

  public configBotsGet(name?: string) {
    const botsConfig = Object.entries(this.ctx.config.adapter).map(([id, origin]) => ({
      id,
      origin,
      schema: Tsu.Intersection(
        adapterConfigSchemaFactory(this.ctx.config.global.lang, this.ctx.config.global.commandPrefix),
        this.ctx[Symbols.adapter].get(origin.extends)?.[1] ?? Tsu.Object({})
      ).schema()
    }))
    if (!name) return botsConfig
    return botsConfig.find(({ id }) => id === name)
  }

  public configBotsUpdate(data: object, name: string) {
    const botConfig = this.ctx.config.adapter[name]
    if (!botConfig) return false
    for (const key in data) {
      if (key in botConfig) botConfig[key as keyof typeof botConfig] = data[key as keyof typeof data]
    }
    return true
  }

  public configGlobalUpdate(data: object) {
    for (const key in data) {
      if (key in this.ctx.config.global)
        this.ctx.config.global[key as keyof typeof this.ctx.config.global] = data[key as keyof typeof data]
    }
  }

  public async configCommandsGet(name?: string) {
    const CommandSettings = Object.entries(await this.ctx.db.get<CommandSettings>('command_settings')).map(
      ([name, data]) => ({ name, data })
    ) as { name: string }[]
    if (!name) return CommandSettings
    return CommandSettings.find(({ name: targetName }) => name === targetName)
  }

  public async configCommandsUpdate(data: object, name: string) {
    const commandSettings = await this.ctx.db.get<CommandSettings>('command_settings')
    const setting = commandSettings[name]
    const command = Array.from(this.ctx[Symbols.command]).find((target) => target.meta.root === name)
    if (!setting || !command) return false
    for (const key in data) {
      if (key in setting) {
        setting[key as keyof typeof setting] = data[key as keyof typeof data]
        command.meta[key as keyof typeof command.meta] = data[key as keyof typeof data]
      }
    }
    await this.ctx.db.put('command_settings', commandSettings)
    return true
  }
}
