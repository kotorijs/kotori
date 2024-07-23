/*
 * @Author: Hotaru biyuehuya@gmail.com
 * @Blog: https://hotaru.icu
 * @Date: 2023-09-29 14:31:09
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2024-06-07 20:14:31
 */
import { AdapterConfig, Adapters, Context, MessageScope, Tsu, stringTemp } from 'kotori-bot';
import Mcwss from 'mcwss';
import WebSocket from 'ws';
import McApi from './api';
import McElements from './elements';

export const config = Tsu.Object({
  nickname: Tsu.String().default('Romi'),
  template: Tsu.Union(Tsu.Null(), Tsu.String()).default('<%nickname%> %msg%')
});

type McConfig = Tsu.infer<typeof config> & AdapterConfig;

type MessageData =
  Parameters<Mcwss['on']> extends [unknown, infer F]
    ? F extends (data: infer D) => void
      ? D extends { header: { eventName: 'PlayerMessage' } }
        ? D
        : never
      : never
    : never;

export class McAdapter extends Adapters.WebSocket<McApi, MessageData> {
  private clients: Record<string, MessageData['client']> = {};

  private messageId = 1;

  public readonly config: McConfig;

  public constructor(ctx: Context, config: McConfig, identity: string) {
    super(ctx, config, identity, McApi, new McElements());
    this.config = config;
  }

  public start() {
    this.connection = (ws, req) => {
      const fakeServer = new WebSocket.Server({ noServer: true });
      const app = new Mcwss({ server: fakeServer });
      app.on('error', (err) => this.ctx.logger.error(err));
      app.on('connection', (data) => {
        this.online();
        this.clients[data.client.sessionId] = data.client;
      });
      app.on('player_message', (data) => this.onMessage(data));
      app.start();
      fakeServer.emit('connection', ws, req);
    };
    this.setup();
  }

  public handle() {
    this.handle.toString();
  }

  public onMessage(data: MessageData) {
    this.session('on_message', {
      type: data.body.type === 'chat' ? MessageScope.GROUP : MessageScope.PRIVATE,
      messageId: this.messageId,
      message: data.body.message,
      userId: `${data.client.sessionId}@${data.body.sender}`,
      sender: {
        nickname: data.body.sender,
        sex: 'unknown',
        age: 0
      },
      groupId: data.body.type === 'chat' ? data.client.sessionId : undefined
    });
    this.messageId += 1;
  }

  public send(action: string, params: { msg: string }) {
    const [sessionId, playerName] = action.split('@');
    const { msg } = params;
    if (!(sessionId in this.clients)) return;
    if (playerName) {
      this.clients[sessionId].run(['msg', `@a[name="${playerName}"]`, msg]);
    } else if (this.config.template) {
      this.clients[sessionId].chatf(stringTemp(this.config.template, { nickname: this.config.nickname, msg }));
    } else {
      this.clients[sessionId].chat(msg);
    }
    this.ctx.emit('send', {
      api: this.api,
      messageId: this.messageId
    });
  }
}

export default McAdapter;
