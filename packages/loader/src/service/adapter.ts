import { Api, Adapter as OriginAdapter } from '@kotori-bot/core';
import { WsRouteHandler } from '../types/server';

/* eslint-disable-next-line @typescript-eslint/no-namespace */
export namespace Adapter {
  export abstract class WebSocket<T extends Api = Api> extends OriginAdapter<T> {
    private isSetup = false;

    private destroyFn?: () => void;

    protected destroy() {
      if (!this.destroyFn) return;
      this.destroyFn();
      this.isSetup = false;
    }

    protected setup() {
      if (this.isSetup) return;
      this.ctx.inject('server');
      this.destroyFn = this.ctx.server.wss(`/adapter/${this.identity}`, (ws, req) => {
        if (this.connection) this.connection(ws, req);
        ws.on('message', (raw) => {
          let data;
          try {
            data = JSON.parse(raw.toString());
          } catch (e) {
            this.ctx.logger.error(`Data parse error: ${e instanceof Error ? e.message : e}`);
          }
          if (data) this.handle(data);
        });
      });
      this.isSetup = true;
    }

    public abstract handle<T extends object>(data: T): void;

    public connection?: (ws: Parameters<WsRouteHandler>[0], req: Parameters<WsRouteHandler>[1]) => void;

    public start() {
      this.setup();
    }

    public stop() {
      this.destroy();
    }
  }
}

export default Adapter;
