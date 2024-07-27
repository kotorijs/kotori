/*
 * @Author: Hotaru biyuehuya@gmail.com
 * @Blog: https://hotaru.icu
 * @Date: 2023-09-29 14:31:09
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2024-07-26 15:24:08
 */
import {
  Adapters,
  type AdapterConfig,
  type Context,
  type EventDataApiBase,
  type string,
  MessageScope,
  Tsu
} from 'kotori-bot'
import WebSocket from 'ws'
import OnebotApi from './api'
import type { EventDataType } from './types'
import OnebotElements from './elements'

interface EventDataPoke extends EventDataApiBase {
  targetId: string

  groupId: string
}

declare module 'kotori-bot' {
  interface EventsMapping {
    poke(session: EventDataPoke): void
  }
}

export const config = Tsu.Union(
  Tsu.Object({
    mode: Tsu.Literal('ws'),
    port: Tsu.Number().int().range(1, 65535),
    address: Tsu.String()
      .regexp(/^ws(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/)
      .default('ws://127.0.0.1'),
    retry: Tsu.Number().int().min(1).default(10)
  }),
  Tsu.Object({
    mode: Tsu.Literal('ws-reverse')
  })
)

type OnebotConfig = Tsu.infer<typeof config> & AdapterConfig

const handleMsg = (msg: string) => msg.replace(/\[CQ:at,qq=(.*?)\]/g, '$1')

export class OnebotAdapter extends Adapters.WebSocket<OnebotApi> {
  private readonly address: string

  private readonly isReverse: boolean

  public readonly config: OnebotConfig

  public constructor(ctx: Context, config: OnebotConfig, identity: string) {
    super(ctx, config, identity, OnebotApi, new OnebotElements())
    this.config = config
    this.address = this.config.mode === 'ws' ? `${this.config.address ?? 'ws://127.0.0.1'}:${this.config.port}` : ''
    this.isReverse = !this.address
    if (!this.isReverse) return
    this.connection = (ws) => {
      this.socket = ws
    }
  }

  public handle(data: EventDataType) {
    if (data.post_type === 'message' && data.message_type === 'private') {
      this.session('on_message', {
        type: MessageScope.PRIVATE,
        userId: data.user_id,
        messageId: data.message_id,
        message: handleMsg(data.message),
        sender: {
          nickname: data.sender.nickname,
          age: data.sender.age,
          sex: data.sender.sex
        },
        groupId: data.group_id
      })
    } else if (data.post_type === 'message' && data.message_type === 'group') {
      this.session('on_message', {
        type: MessageScope.GROUP,
        userId: data.user_id,
        messageId: data.message_id,
        message: handleMsg(data.message),
        sender: {
          nickname: data.sender.nickname,
          age: data.sender.age,
          sex: data.sender.sex,
          level: data.sender.level,
          role: data.sender.role,
          title: data.sender.title
        },
        groupId: data.group_id
      })
    } else if (data.post_type === 'notice' && data.notice_type === 'private_recall') {
      this.session('on_recall', {
        type: MessageScope.PRIVATE,
        userId: data.user_id,
        messageId: data.message_id
      })
    } else if (data.post_type === 'notice' && data.notice_type === 'group_recall') {
      this.session('on_recall', {
        type: MessageScope.GROUP,
        userId: data.user_id,
        messageId: data.message_id,
        groupId: data.group_id,
        operatorId: data.user_id
      })
    } else if (data.post_type === 'request' && data.request_type === 'private') {
      this.session('on_request', {
        type: MessageScope.PRIVATE,
        userId: data.user_id
      })
    } else if (data.post_type === 'request' && data.request_type === 'group') {
      this.session('on_request', {
        type: MessageScope.GROUP,
        userId: data.user_id,
        groupId: data.group_id,
        operatorId: data.operator_id || data.user_id
      })
    } else if (data.post_type === 'notice' && data.notice_type === 'private_add') {
      this.session('on_private_add', {
        userId: data.user_id
      })
    } else if (data.post_type === 'notice' && data.notice_type === 'group_increase') {
      this.session('on_group_increase', {
        userId: data.user_id,
        groupId: data.group_id as number,
        operatorId: data.operator_id || data.user_id
      })
    } else if (data.post_type === 'notice' && data.notice_type === 'group_decrease') {
      this.session('on_group_decrease', {
        userId: data.user_id,
        groupId: data.group_id as number,
        operatorId: data.operator_id || data.user_id
      })
    } else if (data.post_type === 'notice' && data.notice_type === 'group_admin') {
      this.session('on_group_admin', {
        userId: data.user_id,
        groupId: data.group_id as number,
        operation: data.sub_type === 'set' ? 'set' : 'unset'
      })
    } else if (data.post_type === 'notice' && data.notice_type === 'group_ban') {
      this.session('on_group_ban', {
        userId: data.user_id,
        groupId: data.group_id as number,
        operatorId: data.operator_id as number,
        duration: data.duration as number
      })
    } else if (data.post_type === 'meta_event' && data.meta_event_type === 'heartbeat') {
      if (data.status.online) {
        this.online()
        if (this.onlineTimerId) clearTimeout(this.onlineTimerId)
      }
      if (this.selfId === -1 && typeof data.self_id === 'number') {
        this.selfId = data.self_id
        // this.avatar = `https://q.qlogo.cn/g?b=qq&s=640&nk=${this.selfId}`;
      }
    } else if (data.data instanceof Object && typeof data.data.message_id === 'number') {
      this.ctx.emit('send', {
        api: this.api,
        messageId: data.data.message_id
      })
    } else if (
      data.post_type === 'notice' &&
      data.notice_type === 'notify' &&
      data.sub_type === 'poke' &&
      data.target_id
    ) {
      this.session('poke', {
        userId: data.user_id,
        targetId: data.target_id,
        groupId: data.group_id as number
      })
    }
    if (!this.onlineTimerId) this.onlineTimerId = setTimeout(() => this.offline(), 50 * 1000)
  }

  public start() {
    if (this.isReverse) {
      this.setup()
      return
    }
    /* ws mode handle */
    this.ctx.emit('connect', {
      type: 'connect',
      mode: 'ws',
      adapter: this,
      normal: true,
      address: this.address
    })
    this.socket = new WebSocket(`${this.address}`)
    this.socket.on('close', () => {
      this.ctx.emit('connect', {
        type: 'disconnect',
        adapter: this,
        normal: false,
        mode: 'ws',
        address: this.address
      })
    })
    this.socket.on('message', (raw) => this.handle(JSON.parse(raw.toString())))
  }

  public stop() {
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

  public send(action: string, params?: object) {
    this.socket?.send(JSON.stringify({ action, params }))
  }

  private socket: WebSocket | null = null

  /* global NodeJS */
  private onlineTimerId: NodeJS.Timeout | null = null
}
