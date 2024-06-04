/*
 * @Author: Hotaru biyuehuya@gmail.com
 * @Blog: https://hotaru.icu
 * @Date: 2023-09-29 14:31:09
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2024-05-02 18:12:01
 */
import { Adapter, AdapterConfig, Context, MessageScope, Tsu, stringTemp } from 'kotori-bot';
import Mcwss from 'mcwss';
import McApi from './api';
import McElements from './elements';

export const config = Tsu.Object({
  port: Tsu.Number().int().range(1, 65535),
  address: Tsu.String()
    .regexp(/^ws(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/)
    .default('ws://127.0.0.1'),
  nickname: Tsu.String().default('Romi'),
  template: Tsu.Union([Tsu.Null(), Tsu.String()]).default('<%nickname%> %msg%')
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

export class McAdapter extends Adapter<McApi> {
  private app?: Mcwss;

  private clients: Record<string, MessageData['client']> = {};

  private messageId = 1;

  public readonly config: McConfig;

  public constructor(ctx: Context, config: McConfig, identity: string) {
    super(ctx, config, identity, McApi, new McElements());
    this.config = config;
  }

  public handle(data: MessageData) {
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

  public start() {
    this.connect();
    this.ctx.emit('connect', {
      type: 'connect',
      adapter: this,
      normal: true,
      mode: 'ws-reverse',
      address: `${this.config.address}:${this.config.port}`
    });
  }

  public stop() {
    this.app?.stop();
    this.ctx.emit('connect', {
      type: 'disconnect',
      adapter: this,
      normal: true,
      mode: 'other',
      address: `${this.config.address}:${this.config.port}`
    });
    this.offline();
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

  private connect() {
    this.app = new Mcwss({ port: this.config.port, autoRegister: true, autoClearEvents: true });
    this.app.on('error', (err) => this.ctx.logger.error(err));
    this.app.on('connection', (data) => {
      if (Object.keys(this.clients).length === 0) this.online();
      this.clients[data.client.sessionId] = data.client;
    });
    this.app.on('player_message', (data) => this.handle(data));
    this.app.start();
  }
}

export default McAdapter;
