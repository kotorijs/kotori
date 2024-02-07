import { Context, Service } from '@kotori-bot/core';
import express from 'express';

interface ServerConfig {
  port: number;
}

export class Server extends Service<ServerConfig> {
  private server?: ReturnType<ReturnType<typeof express>['listen']>;

  private app?: ReturnType<typeof express>;

  constructor(ctx: Context, config: ServerConfig = { port: 720 }) {
    super(ctx, config, 'server');
  }

  start() {
    if (this.server) return;
    this.app = express();
    this.app.get('/', (_, res) => {
      res.setHeader('Content-type', 'text/html');
      res.send(/* html */ `<h1>Welcome to kotori!</h1>`);
    });
    this.server = this.app.listen(this.config.port);
    this.ctx.logger.label('server').info(`server start at http://127.0.0.1:${this.config.port}`);
  }

  stop() {
    if (!this.server) return;
    this.server.close();
  }
}

export default Server;
