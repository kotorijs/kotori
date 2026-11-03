import { Adapter, type AdapterConfig, type Context, KotoriError, MessageScope, Tsu } from 'kotori-bot'
import WebSocket from 'ws'
import QQApi from './api'
import QQElements from './elements'
import type { ParamsMapping, PayloadData } from './types'

export const config = Tsu.Object({
  appid: Tsu.String().describe('Appid, get from https://q.qq.com/qqbot/'),
  secret: Tsu.String().describe("Bot's secret "),
  sandbox: Tsu.Boolean().default(false).describe('Enable sandbox environment'),
  retry: Tsu.Number().positive().default(10).describe('try reconnect times when disconnected (seconds)'),
  apiAddress: Tsu.String().optional().describe('Custom QQ Open Platform API base URL'),
  wsAddress: Tsu.String().optional().describe('Custom QQ Open Platform WebSocket URL')
})

type QQConfig = Tsu.infer<typeof config> & AdapterConfig

function filterLinks(message: string) {
  return message
    .replace(/http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?/g, '[link]')
    .replace(/[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+\.?/g, '[domain]')
}

export class QQAdapter extends Adapter<QQApi, QQConfig, QQElements> {
  private token = ''

  private seq = 0

  private readonly msgIdList = new Map<string, string>()

  public msgSeq = 0

  public readonly config: QQConfig

  public readonly api: QQApi = new QQApi(this)

  public readonly elements: QQElements = new QQElements(this)

  public readonly platform = 'qq'

  private heartbeatInterval = 30000

  private generateTokenTimerId?: NodeJS.Timeout

  private heartbeatTimerId?: NodeJS.Timeout

  private reconnectTimerId?: NodeJS.Timeout

  private socket: WebSocket | null = null

  public get apiAddress(): string {
    if (this.config.apiAddress) return this.config.apiAddress.replace(/\/+$/, '')
    return this.config.sandbox ? 'https://sandbox.api.sgroup.qq.com' : 'https://api.sgroup.qq.com'
  }

  public get wsAddress(): string {
    if (this.config.wsAddress) return this.config.wsAddress
    return this.config.sandbox ? 'wss://sandbox.api.sgroup.qq.com/websocket' : 'wss://api.sgroup.qq.com/websocket'
  }

  private resolveUrl(path: string): string {
    let clean = path.replace(/^\/+/, '')
    if (clean.startsWith('groups/') || (clean.startsWith('users/') && !clean.startsWith('users/@me'))) {
      clean = `v2/${clean}`
    }
    return `${this.apiAddress}/${clean}`
  }

  private getMsgSeq() {
    this.msgSeq += 1
    return this.msgSeq
  }

  public constructor(ctx: Context, config: QQConfig, identity: string) {
    super(ctx, config, identity)
    this.config = config
  }

  public req<T = unknown>(
    address: string,
    req?: Record<string, unknown>,
    method: 'get' | 'post' | 'delete' | 'patch' | 'put' = 'post'
  ): Promise<T> {
    const url = this.resolveUrl(address)
    const headers = {
      Authorization: `QQBot ${this.token}`,
      'X-Union-Appid': this.config.appid
    }
    // biome-ignore lint/suspicious/noExplicitAny: Http method param constraint
    const payload = req as any
    if (method === 'get') {
      return this.ctx.http.get(url, payload, { headers }) as Promise<T>
    }
    if (method === 'delete') {
      return this.ctx.http.delete(url, payload, { headers }) as Promise<T>
    }
    if (method === 'put') {
      return this.ctx.http.put(url, payload, { headers }) as Promise<T>
    }
    if (method === 'patch') {
      return this.ctx.http.patch(url, payload, { headers }) as Promise<T>
    }
    return this.ctx.http.post(url, payload, { headers }) as Promise<T>
  }

  public async getSelfInfo() {
    const data = await this.req<{ id: string; username: string; avatar: string; bot: boolean }>('users/@me', undefined, 'get')
    if (data?.id) {
      this.selfId = data.id
    }
    return {
      userId: data?.id ?? this.selfId,
      username: data?.username ?? '',
      userDisplayname: data?.username ?? '',
      avatar: data?.avatar ?? ''
    }
  }

  public handle(data: PayloadData) {
    if (data.op === 10) {
      const interval = (data.d as unknown as { heartbeat_interval?: number })?.heartbeat_interval
      if (typeof interval === 'number' && interval > 0) {
        this.heartbeatInterval = interval
      }
      this.send({
        op: 2,
        d: {
          token: `QQBot ${this.token}`,
          intents: (1 << 0) | (1 << 1) | (1 << 12) | (1 << 25) | (1 << 30),
          shard: [0, 1]
        }
      })
      this.heartbeat()
    } else if (data.t === 'READY') {
      if (data.d?.user?.id) {
        this.selfId = data.d.user.id
      }
      this.online()
      this.ctx.emit('connect', {
        type: 'connect',
        adapter: this,
        normal: true,
        mode: 'ws',
        address: this.wsAddress
      })
      this.ctx.logger.info(`[qq/${this.identity}] Bot ready: ${data.d?.user?.username ?? ''} (${this.selfId})`)
    } else if (data.t === 'GROUP_AT_MESSAGE_CREATE') {
      const { message, messageAlt } = this.elements.parseQQMessage(data.d)
      this.session('on_message', {
        type: MessageScope.GROUP,
        userId: data.d.author.member_openid,
        messageId: data.d.id,
        message,
        messageAlt,
        sender: {
          nickname: '',
          role: 'member'
        },
        groupId: data.d.group_openid,
        time: new Date(data.d.timestamp).getTime()
      })
      this.msgIdList.set(data.d.group_openid, data.d.id)
    } else if (data.t === 'C2C_MESSAGE_CREATE') {
      const { message, messageAlt } = this.elements.parseQQMessage(data.d)
      this.session('on_message', {
        type: MessageScope.PRIVATE,
        userId: data.d.author.user_openid,
        messageId: data.d.id,
        message,
        messageAlt,
        time: new Date(data.d.timestamp).getTime(),
        sender: {
          nickname: ''
        }
      })
      this.msgIdList.set(data.d.author.user_openid, data.d.id)
    } else if (data.t === 'DIRECT_MESSAGE_CREATE') {
      const id = `channel-${data.d.author.id}`
      const { message, messageAlt } = this.elements.parseQQMessage(data.d)
      this.session('on_message', {
        type: MessageScope.PRIVATE,
        userId: id,
        messageId: data.d.id,
        message,
        messageAlt,
        time: new Date(data.d.timestamp).getTime(),
        sender: {
          nickname: data.d.author.username ?? ''
        }
      })
      this.msgIdList.set(id, data.d.id)
    } else if (data.t === 'AT_MESSAGE_CREATE') {
      const { message, messageAlt } = this.elements.parseQQMessage(data.d)
      this.session('on_message', {
        type: MessageScope.CHANNEL,
        userId: data.d.author.id,
        messageId: data.d.id,
        message,
        messageAlt,
        channelId: data.d.channel_id,
        guildId: data.d.guild_id,
        time: new Date(data.d.timestamp).getTime(),
        sender: {
          nickname: data.d.author.username ?? ''
        }
      })
      this.msgIdList.set(`${data.d.channel_id}${data.d.guild_id}`, data.d.id)
    } else if (data.t === 'GROUP_ADD_ROBOT') {
      this.session('on_group_increase', {
        type: MessageScope.GROUP,
        groupId: data.d.group_openid,
        userId: data.d.op_member_openid,
        operatorId: data.d.op_member_openid,
        time: data.d.timestamp ? Number(data.d.timestamp) * 1000 : Date.now()
      })
    } else if (data.t === 'GROUP_DEL_ROBOT') {
      this.session('on_group_decrease', {
        type: MessageScope.GROUP,
        groupId: data.d.group_openid,
        userId: data.d.op_member_openid,
        operatorId: data.d.op_member_openid,
        time: data.d.timestamp ? Number(data.d.timestamp) * 1000 : Date.now()
      })
    } else if (data.t === 'FRIEND_ADD') {
      this.session('on_friend_increase', {
        type: MessageScope.PRIVATE,
        userId: data.d.openid,
        time: data.d.timestamp ? Number(data.d.timestamp) * 1000 : Date.now()
      })
    } else if (data.t === 'FRIEND_DEL') {
      this.session('on_friend_decrease', {
        type: MessageScope.PRIVATE,
        userId: data.d.openid,
        time: data.d.timestamp ? Number(data.d.timestamp) * 1000 : Date.now()
      })
    } else if (data.op === 11) {
      this.online()
    } else if (data.op === 7 || data.op === 9) {
      this.ctx.logger.warn(`[qq/${this.identity}] Gateway requested reconnect (op: ${data.op})`)
      this.socket?.close()
    }
    if (data.s) this.seq = data.s
  }

  public async start() {
    await this.generateToken()
    if (this.token) {
      try {
        await this.getSelfInfo()
      } catch (e) {
        this.ctx.logger.debug(`[qq/${this.identity}] getSelfInfo during start failed:`, e)
      }
      this.connect()
    }
  }

  public stop() {
    this.ctx.emit('connect', {
      type: 'disconnect',
      adapter: this,
      normal: true,
      mode: 'ws',
      address: this.wsAddress
    })
    if (this.heartbeatTimerId) {
      clearTimeout(this.heartbeatTimerId)
      this.heartbeatTimerId = undefined
    }
    if (this.generateTokenTimerId) {
      clearTimeout(this.generateTokenTimerId)
      this.generateTokenTimerId = undefined
    }
    if (this.reconnectTimerId) {
      clearTimeout(this.reconnectTimerId)
      this.reconnectTimerId = undefined
    }
    if (this.socket) {
      this.socket.removeAllListeners()
      this.socket.close()
      this.socket = null
    }
    this.offline()
  }

  public send<T extends keyof ParamsMapping>(action: T, params: ParamsMapping[T][0]): Promise<ParamsMapping[T][1]>
  public send(action: object): void
  public async send<T extends keyof ParamsMapping>(action: T | object, params?: ParamsMapping[T][0]): Promise<unknown> {
    if (typeof action === 'object') {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify(action))
      }
      return
    }
    if (!params) return

    if (action === 'sendGroupMsg') {
      const { groupId, message, media: mediaRaw, msgId } = params as ParamsMapping['sendGroupMsg'][0]
      const media = mediaRaw.length > 0 ? mediaRaw[mediaRaw.length - 1] : undefined

      let mediaUpload: { file_info: string } | null = null
      if (media) {
        mediaUpload = await this.req<{ file_info: string }>(`groups/${groupId}/files`, {
          file_type: media.type,
          url: media.value,
          srv_send_msg: false
        })
      }

      const payload: Record<string, unknown> = {
        content: filterLinks(message),
        msg_type: mediaUpload ? 7 : 0,
        msg_seq: this.getMsgSeq()
      }
      const targetMsgId = msgId ?? this.msgIdList.get(groupId)
      if (targetMsgId) payload.msg_id = targetMsgId
      if (mediaUpload) payload.media = mediaUpload

      const res = await this.req<ParamsMapping['sendGroupMsg'][1]>(`groups/${groupId}/messages`, payload)
      return res
    }

    if (action === 'sendPrivateMsg') {
      const { userId, message, media: mediaRaw, msgId } = params as ParamsMapping['sendPrivateMsg'][0]

      if (userId.startsWith('channel-')) {
        const guildId = userId.replace('channel-', '')
        const media = mediaRaw.length > 0 ? mediaRaw[mediaRaw.length - 1] : undefined
        const payload: Record<string, unknown> = {
          content: filterLinks(message)
        }
        const targetMsgId = msgId ?? this.msgIdList.get(userId)
        if (targetMsgId) payload.msg_id = targetMsgId
        if (media?.value) payload.image = media.value
        return this.req<ParamsMapping['sendPrivateMsg'][1]>(`dms/${guildId}/messages`, payload)
      }

      const media = mediaRaw.length > 0 ? mediaRaw[mediaRaw.length - 1] : undefined
      let mediaUpload: { file_info: string } | null = null
      if (media) {
        mediaUpload = await this.req<{ file_info: string }>(`users/${userId}/files`, {
          file_type: media.type,
          url: media.value,
          srv_send_msg: false
        })
      }

      const payload: Record<string, unknown> = {
        content: filterLinks(message),
        msg_type: mediaUpload ? 7 : 0,
        msg_seq: this.getMsgSeq()
      }
      const targetMsgId = msgId ?? this.msgIdList.get(userId)
      if (targetMsgId) payload.msg_id = targetMsgId
      if (mediaUpload) payload.media = mediaUpload

      const res = await this.req<ParamsMapping['sendPrivateMsg'][1]>(`users/${userId}/messages`, payload)
      return res
    }

    if (action === 'sendChannelMsg') {
      const { guildId, channelId, content, image, msgId } = params as ParamsMapping['sendChannelMsg'][0]
      const payload: Record<string, unknown> = {
        content: content ? filterLinks(content) : ''
      }
      const targetMsgId = msgId ?? this.msgIdList.get(`${channelId}${guildId}`)
      if (targetMsgId) payload.msg_id = targetMsgId
      if (image) payload.image = image

      return this.req<ParamsMapping['sendChannelMsg'][1]>(`channels/${channelId}/messages`, payload)
    }

    if (action === 'deleteMsg') {
      const { messageId, groupId, userId, channelId, guildId } = params as ParamsMapping['deleteMsg'][0]
      if (groupId) {
        await this.req(`groups/${groupId}/messages/${messageId}`, undefined, 'delete')
      } else if (userId) {
        if (userId.startsWith('channel-')) {
          const gid = guildId || userId.replace('channel-', '')
          await this.req(`dms/${gid}/messages/${messageId}`, undefined, 'delete')
        } else {
          await this.req(`users/${userId}/messages/${messageId}`, undefined, 'delete')
        }
      } else if (channelId) {
        await this.req(`channels/${channelId}/messages/${messageId}`, undefined, 'delete')
      }
      return
    }

    return
  }

  private async connect() {
    if (this.reconnectTimerId) {
      clearTimeout(this.reconnectTimerId)
      this.reconnectTimerId = undefined
    }
    this.socket = new WebSocket(this.wsAddress)
    this.socket.on('open', () => {
      this.ctx.logger.debug(`[qq/${this.identity}] WebSocket connection opened`)
    })
    this.socket.on('close', (code) => {
      this.ctx.logger.debug(`[qq/${this.identity}] WebSocket closed (${code})`)
      this.offline()
      if (this.heartbeatTimerId) {
        clearTimeout(this.heartbeatTimerId)
        this.heartbeatTimerId = undefined
      }
      if (this.reconnectTimerId) clearTimeout(this.reconnectTimerId)
      this.reconnectTimerId = setTimeout(() => {
        if (!this.socket) return
        this.start()
      }, this.config.retry * 1000)
    })
    this.socket.on('error', (err) => {
      this.ctx.logger.error(`[qq/${this.identity}] WebSocket error:`, err)
    })
    this.socket.on('message', (data) => {
      try {
        this.handle(JSON.parse(data.toString()))
      } catch (e) {
        this.ctx.logger.error(`[qq/${this.identity}] Failed to parse incoming WebSocket message:`, e)
      }
    })
  }

  private async generateToken() {
    try {
      const data = (await this.ctx.http.post('https://bots.qq.com/app/getAppAccessToken', {
        appId: this.config.appid,
        clientSecret: this.config.secret
      })) as { access_token?: string; expires_in?: string | number }
      if (!data?.access_token) {
        this.offline()
        this.ctx.emit('error', new KotoriError('got token error!', this.ctx.identity?.toString()))
        return
      }
      this.token = data.access_token
      const expiresIn = typeof data.expires_in === 'number' ? data.expires_in : Number.parseInt(String(data.expires_in || 7200), 10)
      if (this.generateTokenTimerId) clearTimeout(this.generateTokenTimerId)
      this.generateTokenTimerId = setTimeout(
        () => {
          this.generateToken()
        },
        Math.max((expiresIn - 60) * 1000, 60000)
      )
    } catch (e) {
      this.offline()
      this.ctx.emit(
        'error',
        new KotoriError(`Failed to fetch QQ Bot token: ${e instanceof Error ? e.message : String(e)}`, this.ctx.identity?.toString())
      )
    }
  }

  private heartbeat() {
    if (this.heartbeatTimerId) clearTimeout(this.heartbeatTimerId)
    this.heartbeatTimerId = setTimeout(() => {
      this.send({
        op: 1,
        d: this.seq || null
      })
      this.heartbeat()
    }, this.heartbeatInterval)
  }
}

export default QQAdapter
