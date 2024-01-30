/*
 * @Author: Hotaru biyuehuya@gmail.com
 * @Blog: https://hotaru.icu
 * @Date: 2023-09-29 14:31:09
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2024-01-01 17:06:21
 */
import { Adapter, AdapterConfig, Context, EventDataApiBase, EventDataTargetId, Tsu } from 'kotori-bot';
import WebSocket from 'ws';
import OnebotApi from './api';
import WsServer from './services/wsserver';
import { EventDataType } from './types';
import OnebotElements from './elements';

interface EventDataPoke extends EventDataApiBase<'poke'> {
  targetId: EventDataTargetId;

  groupId: EventDataTargetId;
}

declare module 'kotori-bot' {
  interface EventsList {
    poke: EventDataPoke;
  }
}

export const config = Tsu.Intersection([
  Tsu.Object({
    port: Tsu.Number().int().range(1, 65535),
    address: Tsu.String().regexp(/^ws(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/),
    retry: Tsu.Number().int().min(1).default(10)
  }),
  Tsu.Union([
    Tsu.Object({
      mode: Tsu.Literal('ws')
    }),
    Tsu.Object({
      mode: Tsu.Literal('ws-reverse')
    })
  ])
]);

type OnebotConfig = Tsu.infer<typeof config> & AdapterConfig;

export class OnebotAdapter extends Adapter {
  private readonly info: string;

  readonly config: OnebotConfig;

  constructor(ctx: Context, config: OnebotConfig, identity: string) {
    super(ctx, config, identity, OnebotApi, OnebotElements);
    this.config = config;
    this.info = `${this.config.address}:${this.config.port}`;
  }

  handle(data: EventDataType) {
    if (data.post_type === 'message' && data.message_type === 'private') {
      this.emit('private_msg', {
        userId: data.user_id,
        messageId: data.message_id,
        message: data.message,
        sender: {
          nickname: data.sender.nickname,
          age: data.sender.age,
          sex: data.sender.sex
        },
        groupId: data.group_id
      });
    } else if (data.post_type === 'message' && data.message_type === 'group') {
      this.emit('group_msg', {
        userId: data.user_id,
        messageId: data.message_id,
        message: data.message,
        sender: {
          nickname: data.sender.nickname,
          age: data.sender.age,
          sex: data.sender.sex
        },
        groupId: data.group_id!
      });
    } else if (data.post_type === 'notice' && data.notice_type === 'private_recall') {
      this.emit('private_recall', {
        userId: data.user_id,
        messageId: data.message_id
      });
    } else if (data.post_type === 'notice' && data.notice_type === 'group_recall') {
      this.emit('group_recall', {
        userId: data.user_id,
        messageId: data.message_id,
        groupId: data.group_id!,
        operatorId: data.operator_id || data.user_id
      });
    } else if (data.post_type === 'request' && data.request_type === 'private') {
      this.emit('private_request', {
        userId: data.user_id
      });
    } else if (data.post_type === 'request' && data.request_type === 'group') {
      this.emit('group_request', {
        userId: data.user_id,
        groupId: data.group_id!,
        operatorId: data.operator_id || data.user_id
      });
    } else if (data.post_type === 'notice' && data.notice_type === 'private_add') {
      this.emit('private_add', {
        userId: data.user_id
      });
    } else if (data.post_type === 'notice' && data.notice_type === 'group_increase') {
      this.emit('group_increase', {
        userId: data.user_id,
        groupId: data.group_id!,
        operatorId: data.operator_id || data.user_id
      });
    } else if (data.post_type === 'notice' && data.notice_type === 'group_decrease') {
      this.emit('group_decrease', {
        userId: data.user_id,
        groupId: data.group_id!,
        operatorId: data.operator_id || data.user_id
      });
    } else if (data.post_type === 'notice' && data.notice_type === 'group_admin') {
      this.emit('group_admin', {
        userId: data.user_id,
        groupId: data.group_id!,
        operation: data.sub_type === 'set' ? 'set' : 'unset'
      });
    } else if (data.post_type === 'notice' && data.notice_type === 'group_ban') {
      this.emit('group_ban', {
        userId: data.user_id,
        groupId: data.group_id!,
        operatorId: data.operator_id,
        time: data.duration!
      });
    } else if (data.post_type === 'meta_event' && data.meta_event_type === 'heartbeat') {
      if (data.status.online) {
        this.online();
        if (this.onlineTimerId) clearTimeout(this.onlineTimerId);
      }
      if (this.selfId === -1 && typeof data.self_id === 'number') {
        this.selfId = data.self_id;
        // this.avatar = `https://q.qlogo.cn/g?b=qq&s=640&nk=${this.selfId}`;
      }
    } else if (data.data instanceof Object && typeof data.data.message_id === 'number') {
      this.ctx.emit('send', {
        api: this.api,
        messageId: data.data.message_id
      });
    } else if (
      data.post_type === 'notice' &&
      data.notice_type === 'notify' &&
      data.sub_type === 'poke' &&
      data.target_id
    ) {
      this.emit('poke', {
        userId: data.user_id,
        targetId: data.target_id,
        groupId: data.group_id!
      });
    }
    if (!this.onlineTimerId) this.onlineTimerId = setTimeout(() => this.offline, 50 * 1000);
  }

  start() {
    if (this.config.mode === 'ws-reverse') {
      this.ctx.emit('connect', {
        service: this,
        normal: true,
        info: `start wsserver at ${this.info}`,
        onlyStart: true
      });
    }
    this.connectWss();
  }

  stop() {
    this.ctx.emit('disconnect', {
      service: this,
      normal: true,
      info: this.config.mode === 'ws' ? `disconnect from ${this.info}` : `stop wsserver at ${this.info}`
    });
    this.socket?.close();
    this.offline();
  }

  send(action: string, params?: object) {
    this.socket?.send(JSON.stringify({ action, params }));
  }

  private socket: WebSocket | null = null;

  private async connectWss() {
    if (this.config.mode === 'ws-reverse') {
      const wss = await WsServer(this.config.port);
      const { 0: socket } = wss;
      this.socket = socket;
      this.ctx.emit('connect', {
        service: this,
        normal: true,
        info: `client connect to ${this.info}`
      });
      this.socket?.on('close', () => {
        this.ctx.emit('disconnect', {
          service: this,
          normal: false,
          info: `unexpected client disconnect from ${this.info}`
        });
        wss[1].close();
        this.connectWss();
      });
    } else {
      this.ctx.emit('connect', {
        service: this,
        normal: true,
        info: `connect server to ${this.info}`
      });
      this.socket = new WebSocket(`${this.info}`);
      this.socket.on('close', () => {
        this.ctx.emit('disconnect', {
          service: this,
          normal: false,
          info: `unexpected disconnect server from ${this.info}, will reconnect in ${this.config.retry} seconds`
        });
        setTimeout(() => {
          if (!this.socket) return;
          this.socket.close();
          this.ctx.emit('connect', {
            service: this,
            normal: false,
            info: `reconnect server to ${this.info}`
          });
          this.connectWss();
        }, this.config.retry * 1000);
      });
    }
    this.socket.on('message', (data) => this.handle(JSON.parse(data.toString())));
  }

  /* global NodeJS */
  private onlineTimerId: NodeJS.Timeout | null = null;
}
