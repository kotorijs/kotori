import { Adapter, type AdapterConfig, type Context, MessageScope, Tsu, KotoriError } from 'kotori-bot'
import WebSocket from 'ws'
import QQApi from './api'
import type { ParamsMapping, PayloadData } from './types'
import QQElements from './elements'

const WS_ADDRESS = 'wss://api.sgroup.qq.com/websocket'
const API_ADDRESS = 'https://api.sgroup.qq.com/v2'

export const config = Tsu.Object({
  appid: Tsu.String().describe('Appid, get from https://q.qq.com/qqbot/'),
  secret: Tsu.String().describe("Bot's secret "),
  retry: Tsu.Number().positive().default(10).describe('try reconnect times when disconnected (seconds)')
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

  /* here need */
  public msgSeq = 0

  public readonly config: QQConfig

  public readonly api: QQApi = new QQApi(this)

  public readonly elements: QQElements = new QQElements(this)

  public readonly platform = 'qq'

  private getMsgSeq() {
    this.msgSeq += 1
    return this.seq
  }

  public constructor(ctx: Context, config: QQConfig, identity: string) {
    super(ctx, config, identity)
    this.config = config
  }

  // biome-ignore lint:
  public req(address: string, req: Record<string, any>) {
    return this.ctx.http.post(`${API_ADDRESS}/${address}`, req, {
      headers: {
        Authorization: `QQBot ${this.token}`,
        'X-Union-Appid': this.config.appid
      },
      validateStatus: () => true
    })
  }

  public handle(data: PayloadData) {
    if (data.op === 10) {
      this.send({
        op: 2,
        d: {
          token: `QQBot ${this.token}`,
          intents: 1241513984,
          shard: [0, 1]
        }
      })
    } else if (data.t === 'READY') {
      this.ctx.emit('connect', {
        type: 'connect',
        adapter: this,
        normal: true,
        mode: 'ws',
        address: WS_ADDRESS
      })
      this.heartbeat()
    } else if (data.t === 'GROUP_AT_MESSAGE_CREATE') {
      this.session('on_message', {
        type: MessageScope.GROUP,
        userId: data.d.author.member_openid,
        messageId: data.d.id,
        message: data.d.content.trim(),
        messageAlt: data.d.content.trim(),
        sender: {
          nickname: '',
          role: 'member'
        },
        groupId: data.d.group_openid,
        time: new Date(data.d.timestamp).getTime()
      })
      this.msgIdList.set(data.d.group_openid, data.d.id)
    } else if (data.t === 'DIRECT_MESSAGE_CREATE') {
      this.session('on_message', {
        type: MessageScope.CHANNEL,
        userId: data.d.author.id,
        messageId: data.d.id,
        message: data.d.content.trim(),
        messageAlt: data.d.content.trim(),
        channelId: data.d.channel_id,
        guildId: data.d.guild_id,
        time: new Date(data.d.timestamp).getTime(),
        sender: {
          nickname: ''
        }
      })
      this.msgIdList.set(`${data.d.channel_id}${data.d.guild_id}`, data.d.id)
    } else if (data.op === 11) {
      this.online()
    }
    if (data.s) this.seq = data.s
  }

  public start() {
    this.generateToken()
    this.connect()
  }

  public stop() {
    this.ctx.emit('connect', {
      type: 'disconnect',
      adapter: this,
      normal: true,
      mode: 'ws',
      address: WS_ADDRESS
    })
    this.socket?.close()
    this.offline()
  }

  public send<T extends keyof ParamsMapping>(action: T, params: ParamsMapping[T][0]): Promise<ParamsMapping[T][1]>
  public send(action: object): void
  public async send<T extends keyof ParamsMapping>(action: T | object, params?: ParamsMapping[T][0]) {
    if (typeof action === 'object') {
      this.socket?.send(JSON.stringify(action))
      return
    }
    if (!params) return
    if (action === 'sendGroupMsg') {
      const { groupId, message, media: mediaRaw } = params as ParamsMapping['sendGroupMsg'][0]
      let media: string[] = []
      if (mediaRaw.length > 0) {
        media = await Promise.all(
          mediaRaw.map(
            async ({ type, value }) =>
              (
                (await this.req(`groups/${groupId}/files`, { file_type: type, url: value, srv_send_msg: false })) as {
                  file_info: string
                }
              ).file_info
          )
        )
      }

      return this.req(`groups/${groupId}/messages`, {
        content: filterLinks(message),
        msg_type: media.length > 0 ? 7 : 0,
        msg_id: this.msgIdList.get(groupId) ?? null,
        msg_seq: this.getMsgSeq()
      })
    }
    if (action === 'sendChannelMsg') {
      const { guildId, channelId, content, image } = params as ParamsMapping['sendChannelMsg'][0]
      return this.req(`channels/${channelId}/messages`, {
        content: content ? filterLinks(content) : '',
        msg_id: this.msgIdList.get(`${channelId}${guildId}`) ?? null,
        image
      })
    }
    return
  }

  private socket: WebSocket | null = null

  private async connect() {
    this.socket = new WebSocket(WS_ADDRESS)
    this.socket.on('close', () => {
      this.ctx.emit('connect', {
        type: 'disconnect',
        adapter: this,
        normal: false,
        address: WS_ADDRESS,
        mode: 'ws'
      })
      clearTimeout(this.heartbeatTimerId)
      setTimeout(() => {
        if (!this.socket) return
        this.socket.close()
        this.ctx.emit('connect', {
          type: 'connect',
          adapter: this,
          normal: false,
          mode: 'ws',
          address: WS_ADDRESS
        })
        this.start()
      }, this.config.retry * 1000)
    })
    this.socket.on('message', (data) => this.handle(JSON.parse(data.toString())))
  }

  private async generateToken() {
    const data = (await this.ctx.http.post('https://bots.qq.com/app/getAppAccessToken', {
      appId: this.config.appid,
      clientSecret: this.config.secret
    })) as Record<string, string>
    if (!data.access_token) {
      this.offline()
      this.ctx.emit('error', new KotoriError('got token error!', this.ctx.identity?.toString()))
      return
    }
    this.token = data.access_token
    this.generateTokenTimerId = setTimeout(
      () => {
        if (this.generateTokenTimerId) clearInterval(this.generateTokenTimerId)
        this.generateToken()
      },
      (Number.parseInt(data.expires_in, 10) - 30) * 1000
    )
  }

  private heartbeat() {
    this.heartbeatTimerId = setTimeout(() => {
      this.send({
        op: 1,
        d: this.seq || null
      })
      if (this.heartbeatTimerId) clearInterval(this.heartbeatTimerId)
      this.heartbeat()
    }, 7 * 1000)
  }

  private generateTokenTimerId?: NodeJS.Timeout

  private heartbeatTimerId?: NodeJS.Timeout
}

export default QQAdapter
