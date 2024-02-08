/*
 * @Author: Hotaru biyuehuya@gmail.com
 * @Blog: https://hotaru.icu
 * @Date: 2023-09-29 14:31:09
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2024-02-08 18:33:57
 */
import { Adapter, AdapterConfig, Context, MessageScope, Tsu, obj } from 'kotori-bot';
import WebSocket from 'ws';
import QQApi from './api';
import { PlayloadData } from './types';
import QQElements from './elements';

const WS_ADDRESS = 'wss://api.sgroup.qq.com/websocket';
const API_ADDRESS = 'https://api.sgroup.qq.com/v2';

export const config = Tsu.Object({
  appid: Tsu.String(),
  secret: Tsu.String(),
  retry: Tsu.Number().positive().default(10)
});

type QQConfig = Tsu.infer<typeof config> & AdapterConfig;

export class QQAdapter extends Adapter<QQApi> {
  private token = '';

  private seq = 0;

  /* here need */
  msg_seq = 0;

  private groupId = '';

  imageStack: (string | true)[] = [];

  readonly config: QQConfig;

  constructor(ctx: Context, config: QQConfig, identity: string) {
    super(ctx, config, identity, QQApi, new QQElements());
    this.config = config;
  }

  handle(data: PlayloadData) {
    if (data.op === 10) {
      this.send('ws', {
        op: 2,
        d: {
          token: `QQBot ${this.token}`,
          intents: 1241513984,
          shard: [0, 1]
        }
      });
    } else if (data.t === 'READY') {
      this.ctx.emit('connect', {
        type: 'connect',
        adapter: this,
        normal: true,
        mode: 'ws',
        address: WS_ADDRESS
      });
      this.heartbeat();
    } else if (data.t === 'GROUP_AT_MESSAGE_CREATE') {
      this.session('on_message', {
        type: MessageScope.GROUP,
        userId: data.d.author.member_openid,
        messageId: data.d.id,
        extra: data.d.id,
        message: data.d.content.trim(),
        sender: {
          nickname: '',
          age: 0,
          sex: 'unknown',
          level: '0',
          role: 'member',
          title: ''
        },
        groupId: data.d.group_openid
      });
      this.groupId = data.d.group_openid;
      /* here need imporve */
    } else if (data.op === 11) {
      this.online();
      // this.offlineCheck();
    }
    if (data.s) this.seq = data.s;
    // if (!this.onlineTimerId) this.onlineTimerId = setTimeout(() => this.offline, 50 * 1000);
  }

  start() {
    this.getToken();
    this.connect();
  }

  stop() {
    this.ctx.emit('connect', {
      type: 'disconnect',
      adapter: this,
      normal: true,
      mode: 'ws',
      address: WS_ADDRESS
    });
    this.socket?.close();
    this.offline();
  }

  send(action: string, params: object) {
    if (action === 'ws') {
      this.socket?.send(JSON.stringify(params));
      return undefined;
    }
    let address = '/';
    let cancel = false;
    let req: obj = {};
    if (action === 'send_group_msg' && 'groupId' in params && 'message' in params && 'id' in params) {
      if (!params.message) return null;
      address += `groups/${params.groupId}/messages`;
      req = {
        content: params.message,
        msg_type: 0,
        msg_id: params.id,
        msg_seq: this.msg_seq
      };
      if (this.imageStack[this.msg_seq]) {
        cancel = true;
        let timerId: NodeJS.Timeout;
        const timer = () =>
          setTimeout(() => {
            if (timerId) clearTimeout(timerId);
            if (this.imageStack[this.msg_seq] === true) {
              timerId = timer();
              return;
            }
            req.file_info = { file_info: this.imageStack[this.msg_seq] };
            req.msg_type = 7;
            this.ctx.http.post(`${API_ADDRESS}${address}`, req, {
              headers: {
                Authorization: `QQBot ${this.token}`,
                'X-Union-Appid': this.config.appid
              },
              validateStatus: () => true
            });
          }, 500);
      }
      this.msg_seq += 1;
    } else if (action === 'send_group_msg_media' && 'url' in params && 'file_type' in params) {
      address += `groups/${this.groupId}/files`;
      req = {
        file_type: params.file_type,
        url: params.url,
        srv_send_msg: false
      };
      this.msg_seq += 1;
    }
    if (cancel) return undefined;
    return this.ctx.http.post(`${API_ADDRESS}${address}`, req, {
      headers: {
        Authorization: `QQBot ${this.token}`,
        'X-Union-Appid': this.config.appid
      },
      validateStatus: () => true
    });
  }

  private socket: WebSocket | null = null;

  private async connect() {
    this.socket = new WebSocket(WS_ADDRESS);
    this.socket.on('close', () => {
      this.ctx.emit('connect', {
        type: 'disconnect',
        adapter: this,
        normal: false,
        address: WS_ADDRESS,
        mode: 'ws'
      });
      setTimeout(() => {
        if (!this.socket) return;
        this.socket.close();
        this.ctx.emit('connect', {
          type: 'connect',
          adapter: this,
          normal: false,
          mode: 'ws',
          address: WS_ADDRESS
        });
        this.start();
      }, this.config.retry * 1000);
    });
    this.socket.on('message', (data) => this.handle(JSON.parse(data.toString())));
  }

  private async getToken() {
    const data = (await this.ctx.http.post('https://bots.qq.com/app/getAppAccessToken', {
      appId: this.config.appid,
      clientSecret: this.config.secret
    })) as any;
    if (!data.access_token) {
      this.offline();
      this.ctx.logger.error('got token error!');
      return;
    }
    this.token = data.access_token;
    this.getTokenTimerId = setTimeout(
      () => {
        if (this.getTokenTimerId) clearInterval(this.getTokenTimerId);
        this.getToken();
      },
      (parseInt(data.expires_in, 10) - 30) * 1000
    );
  }

  private async heartbeat() {
    this.heartbeatTimerId = setTimeout(() => {
      this.send('ws', {
        op: 1,
        d: this.seq || null
      });
      if (this.heartbeatTimerId) clearInterval(this.heartbeatTimerId);
      this.heartbeat();
    }, 7 * 1000);
  }

  /* global NodeJS */
  private getTokenTimerId?: NodeJS.Timeout;

  private heartbeatTimerId?: NodeJS.Timeout;
}

export default QQAdapter;
