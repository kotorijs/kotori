/*
 * @Author: Hotaru biyuehuya@gmail.com
 * @Blog: https://hotaru.icu
 * @Date: 2023-09-29 14:31:09
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2024-02-17 18:07:16
 */
import { Adapter, AdapterConfig, Context, Tsu } from 'kotori-bot';
import WebSocket from 'ws';
import SandboxApi from './api';
import SandboxElements from './elements';

export const config = Tsu.Object({
  port: Tsu.Number().int().range(1, 65535),
  address: Tsu.String()
    .regexp(/^ws(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/)
    .default('ws://127.0.0.1')
});

type SandboxConfig = Tsu.infer<typeof config> & AdapterConfig;

export class SandboxAdapter extends Adapter {
  private readonly address: string;

  readonly config: SandboxConfig;

  constructor(ctx: Context, config: SandboxConfig, identity: string) {
    super(ctx, config, identity, SandboxApi, new SandboxElements());
    this.config = config;
    this.address = `${this.config.address ?? 'ws://127.0.0.1'}:${this.config.port}`;
  }

  handle(data: Record<string, unknown>) {
    if ('selfId' in data) {
      this.selfId = data.selfId as string;
      return;
    }
    if (data.userId === this.selfId) return;
    (this.session as (type: string, d: typeof data) => void)(data.event as string, data);
  }

  start() {
    this.ctx.emit('connect', {
      type: 'connect',
      mode: 'ws-reverse',
      adapter: this,
      normal: true,
      address: this.address
    });
    this.connectWss();
  }

  stop() {
    this.ctx.emit('connect', {
      type: 'disconnect',
      adapter: this,
      normal: true,
      address: this.address,
      mode: 'ws-reverse'
    });
    this.socket?.close();
    this.offline();
  }

  send(action: string, params?: object) {
    this.socket?.send(JSON.stringify({ action, params }));
  }

  private socket?: WebSocket;

  private server?: WebSocket.Server;

  private async connectWss() {
    this.server = new WebSocket.Server({ port: this.config.port });
    this.server.on('connection', (ws) => {
      this.socket = ws;
      this.online();
      this.socket.send(JSON.stringify({ test: 1 }));
      this.socket.on('message', (data) => this.handle(JSON.parse(data.toString())));
      this.socket.on('close', () => {
        this.offline();
        this.socket?.close();
      });
    });
  }
}
