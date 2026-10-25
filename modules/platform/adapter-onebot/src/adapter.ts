import { type AdapterConfig, Adapters, type Context, type EventDataApiBase, KotoriError, MessageScope, type Session, Tsu } from 'kotori-bot'
import WebSocket from 'ws'
import OnebotApi from './api'
import OnebotElements from './elements'
import type { EventDataType } from './types'

interface EventDataPoke extends EventDataApiBase {
  targetId: string

  groupId: string
}

declare module 'kotori-bot' {
  interface EventsMapping {
    onebot_poke(session: Session<EventDataPoke>): void
    literal_onebot_raw_data(data: Exclude<EventDataType['data'], undefined> | object): void
  }
}

export const config = Tsu.Union(
  Tsu.Object({
    mode: Tsu.Literal('ws').describe('Connect mode: WebSocket'),
    port: Tsu.Number().port().describe('WebSocket server port'),
    address: Tsu.String()
      .regexp(/^ws(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/)
      .default('ws://127.0.0.1')
      .describe('WebSocket address'),
    accessToken: Tsu.String().optional().describe('Access token for authentication'),
    retry: Tsu.Number().int().min(1).default(10).describe('try reconnect times when disconnected')
  }),
  Tsu.Object({
    mode: Tsu.Literal('ws-reverse').describe('Connect mode: WebSocket Reverse'),
    accessToken: Tsu.String().optional().describe('Access token for reverse websocket authentication')
  })
)

type OnebotConfig = Tsu.infer<typeof config> & AdapterConfig

const handleMsg = (msg?: unknown) => (typeof msg === 'string' ? msg.replace(/\[CQ:at,qq=(.*?)\]/g, '$1') : '')

export class OnebotAdapter extends Adapters.WebSocket<OnebotApi, OnebotConfig, OnebotElements> {
  private readonly address: string

  private readonly isReverse: boolean

  public readonly config: OnebotConfig

  public readonly elements: OnebotElements

  public readonly api: OnebotApi

  public readonly platform = 'onebot'

  public pendingRequests = new Map<
    string,
    {
      resolve: (data: unknown) => void
      reject: (err: unknown) => void
      timer: NodeJS.Timeout
    }
  >()

  public constructor(ctx: Context, config: OnebotConfig, identity: string) {
    super(ctx, config, identity)
    this.config = config
    this.api = new OnebotApi(this)
    this.elements = new OnebotElements(this)
    this.address = this.config.mode === 'ws' ? `${this.config.address ?? 'ws://127.0.0.1'}:${this.config.port}` : ''
    this.isReverse = !this.address
    if (!this.isReverse) return
    this.connection = (ws, req) => {
      const clientIp = req?.socket?.remoteAddress ?? 'unknown'
      if (this.config.accessToken) {
        const auth = req?.headers.authorization
        const tokenFromHeader = auth?.startsWith('Bearer ') ? auth.slice(7) : auth?.startsWith('Token ') ? auth.slice(6) : auth
        const tokenFromUrl = req?.url ? new URL(req.url, 'http://127.0.0.1').searchParams.get('access_token') : null
        const receivedToken = tokenFromHeader ?? tokenFromUrl

        if (receivedToken !== this.config.accessToken) {
          this.ctx.logger.warn(
            `[onebot/${this.identity}] Unauthorized reverse WebSocket connection from ${clientIp}. ` +
              `Token mismatched or missing (expected: configured token, got: ${receivedToken ? '***' : 'none'}).`
          )
          ws.close(4001, 'Unauthorized')
          return
        }
      }
      this.socket = ws
      this.online()
      this.ctx.logger.info(`[onebot/${this.identity}] Reverse WebSocket client connected successfully from ${clientIp}.`)
    }
  }

  public handle(data: EventDataType | { echo: string; status: 'ok' | 'failed'; data: unknown }) {
    if ('echo' in data) {
      if (!this.pendingRequests.has(data.echo)) return
      const { resolve, reject, timer } = this.pendingRequests.get(data.echo)!
      clearTimeout(timer)
      this.pendingRequests.delete(data.echo)
      if (data.status === 'ok') {
        resolve(data.data)
      } else {
        reject(data)
      }
      return
    }

    if (this.selfId === '' && typeof data.self_id === 'number') this.selfId = String(data.self_id)

    const rawMsg =
      data.raw_message ??
      (typeof data.message === 'string'
        ? data.message
        : Array.isArray(data.message)
          ? (data.message as unknown as { type: string; data?: Record<string, unknown> }[])
              .map((seg) =>
                seg.type === 'text'
                  ? String(seg.data?.text ?? '')
                  : `[CQ:${seg.type}${Object.entries(seg.data ?? {})
                      .map(([k, v]) => `,${k}=${v}`)
                      .join('')}]`
              )
              .join('')
          : '')

    if (data.post_type === 'message' && data.message_type === 'private') {
      this.session('on_message', {
        type: MessageScope.PRIVATE,
        userId: String(data.user_id),
        messageId: String(data.message_id),
        message: handleMsg(rawMsg),
        messageAlt: rawMsg,
        sender: {
          nickname: data.sender?.nickname ?? String(data.user_id)
        },
        groupId: data.group_id ? String(data.group_id) : undefined,
        time: data.time
      })
    } else if (data.post_type === 'message' && data.message_type === 'group') {
      this.session('on_message', {
        type: MessageScope.GROUP,
        userId: String(data.user_id),
        messageId: String(data.message_id),
        message: handleMsg(rawMsg),
        messageAlt: rawMsg,
        sender: {
          nickname: data.sender?.nickname ?? String(data.user_id),
          role: data.sender?.role ?? 'member'
        },
        groupId: String(data.group_id),
        time: data.time
      })
    } else if (data.post_type === 'notice' && data.notice_type === 'private_recall') {
      this.session('on_message_delete', {
        type: MessageScope.PRIVATE,
        userId: String(data.user_id),
        messageId: String(data.message_id),
        time: data.time
      })
    } else if (data.post_type === 'notice' && data.notice_type === 'group_recall') {
      this.session('on_message_delete', {
        type: MessageScope.GROUP,
        userId: String(data.user_id),
        messageId: String(data.message_id),
        groupId: String(data.group_id),
        operatorId: String(data.operator_id ?? data.user_id),
        time: data.time
      })
    } else if (data.post_type === 'request' && data.request_type === 'private') {
      this.session('on_request', {
        type: MessageScope.PRIVATE,
        userId: String(data.user_id),
        comment: String(data.comment),
        time: data.time,
        approve: (approve = true, remark = '') => this.call('set_friend_add_request', { flag: data.flag, approve, remark })
      })
    } else if (data.post_type === 'request' && data.request_type === 'group') {
      this.session('on_request', {
        type: MessageScope.GROUP,
        userId: String(data.user_id),
        groupId: String(data.group_id),
        operatorId: String(data.operator_id ?? data.user_id),
        comment: String(data.comment),
        approve: (approve = true, reason = '') =>
          this.call('set_group_add_request', { flag: data.flag, approve, reason, sub_type: data.sub_type }),
        time: data.time
      })
    } else if (data.post_type === 'notice' && data.notice_type === 'group_increase') {
      this.session('on_group_increase', {
        type: MessageScope.GROUP,
        userId: String(data.user_id),
        groupId: String(data.group_id),
        operatorId: String(data.operator_id) ?? String(data.user_id),
        time: data.time
      })
    } else if (data.post_type === 'notice' && data.notice_type === 'group_decrease') {
      this.session('on_group_decrease', {
        type: MessageScope.GROUP,
        userId: String(data.user_id),
        groupId: String(data.group_id),
        operatorId: String(data.operator_id) ?? String(data.user_id),
        time: data.time
      })
    } else if (data.post_type === 'notice' && data.notice_type === 'group_admin') {
      this.session('on_group_admin', {
        type: MessageScope.GROUP,
        userId: String(data.user_id),
        groupId: String(data.group_id),
        operation: data.sub_type === 'set' ? 'set' : 'unset',
        time: data.time
      })
    } else if (data.post_type === 'notice' && data.notice_type === 'group_ban') {
      this.session('on_group_ban', {
        type: MessageScope.GROUP,
        userId: String(data.user_id),
        groupId: String(data.group_id),
        operatorId: String(data.operator_id),
        duration: Number(data.duration),
        time: data.time
      })
    } else if (data.post_type === 'meta_event' && data.meta_event_type === 'heartbeat') {
      if (data.status.online) {
        this.online()
        if (this.onlineTimerId) clearTimeout(this.onlineTimerId)
      }
      if (this.selfId === '' && typeof data.self_id === 'number') {
        this.selfId = String(data.self_id)
        // this.avatar = `https://q.qlogo.cn/g?b=qq&s=640&nk=${this.selfId}`;
      }
    } else if (data.post_type === 'notice' && data.notice_type === 'notify' && data.sub_type === 'poke' && data.target_id) {
      this.session('onebot_poke', {
        type: data.message_type === 'private' ? MessageScope.PRIVATE : MessageScope.GROUP,
        userId: String(data.user_id),
        targetId: String(data.target_id),
        groupId: String(data.group_id),
        time: data.time
      })
    }
    if (!this.onlineTimerId) this.onlineTimerId = setTimeout(() => this.offline(), 50 * 1000)
  }

  private socket: WebSocket | null = null

  private onlineTimerId: NodeJS.Timeout | null = null

  private retryCount = 0

  private reconnectTimer: NodeJS.Timeout | null = null

  private isManualStop = false

  public start() {
    if (this.isReverse) {
      this.setup()
      return
    }
    this.isManualStop = false
    this.connectWs()
  }

  private connectWs() {
    const hasToken = 'accessToken' in this.config && Boolean(this.config.accessToken)
    const headers = hasToken ? { Authorization: `Bearer ${this.config.accessToken}` } : undefined
    this.ctx.emit('connect', {
      type: 'connect',
      mode: 'ws',
      adapter: this,
      normal: true,
      address: this.address
    })
    this.ctx.logger.info(
      `[onebot/${this.identity}] Connecting to WebSocket server at ${this.address}${hasToken ? ' (with token auth)' : ''}...`
    )
    this.socket = new WebSocket(this.address, { headers })
    this.socket.on('open', () => {
      this.retryCount = 0
      this.online()
      this.ctx.logger.info(`[onebot/${this.identity}] WebSocket connected successfully to ${this.address}.`)
    })
    this.socket.on('error', (err) => {
      this.ctx.logger.warn(`[onebot/${this.identity}] WebSocket error on ${this.address}: ${err.message}`)
    })
    this.socket.on('close', (code, reason) => {
      this.offline()
      const reasonStr = reason?.toString() ? ` (reason: ${reason.toString()})` : ''
      this.ctx.logger.warn(`[onebot/${this.identity}] WebSocket closed with code ${code}${reasonStr}.`)
      this.ctx.emit('connect', {
        type: 'disconnect',
        adapter: this,
        normal: this.isManualStop,
        mode: 'ws',
        address: this.address
      })
      if (!this.isManualStop && 'retry' in this.config && this.retryCount < (this.config.retry ?? 10)) {
        this.retryCount += 1
        const delay = Math.min(this.retryCount * 2000, 30000)
        this.ctx.logger.info(
          `[onebot/${this.identity}] Reconnecting to ${this.address} in ${delay / 1000}s (attempt ${this.retryCount}/${this.config.retry ?? 10})...`
        )
        this.reconnectTimer = setTimeout(() => this.connectWs(), delay)
      }
    })
    this.socket.on('message', (raw) => this.handle(JSON.parse(raw.toString())))
  }

  public stop() {
    this.isManualStop = true
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
    if (this.isReverse) {
      super.stop()
      return
    }
    this.ctx.emit('connect', {
      type: 'disconnect',
      adapter: this,
      normal: true,
      address: this.address,
      mode: 'ws'
    })
    this.socket?.close()
  }
  public send(content: EventDataType, operation?: object) {
    this.socket?.send(JSON.stringify({ content, operation }))
  }

  public call<T = void>(action: string, params?: unknown): Promise<T> {
    return new Promise((resolve, reject) => {
      const echo = `${Date.now()}_${Math.random().toString(36)}`
      const timer = setTimeout(() => {
        this.pendingRequests.delete(echo)
        reject(new KotoriError(`Request timeout: ${action}`))
      }, 60 * 1000)

      this.pendingRequests.set(echo, { resolve: resolve as (data: unknown) => void, reject, timer })
      this.socket?.send(JSON.stringify({ action, params, echo }))
    })
  }
}

export default OnebotAdapter
