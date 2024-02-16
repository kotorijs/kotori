import { Context, Service, Symbols } from '@kotori-bot/core';
import express from 'express';

interface ServerConfig {
  port: number;
}

export class Server extends Service<ServerConfig> {
  private app: ReturnType<typeof express>;

  private server?: ReturnType<ReturnType<typeof express>['listen']>;

  constructor(ctx: Context, config: ServerConfig = { port: 720 }) {
    super(ctx, config, 'server');

    this.app = express();
    this.app.use('/', (_, res, next) => {
      let isWebui = false;
      ctx[Symbols.modules].forEach((module) => {
        if (isWebui) return;
        if (module[0].pkg.name === '@kotori-bot/kotori-plugin-webui') isWebui = true;
      });
      if (!isWebui) {
        res.setHeader('Content-type', 'text/html');
        res.send(/* html */ `<h1>Welcome to kotori!</h1>`);
      }
      next();
    });
    this.get = this.app.get.bind(this.app);
    this.post = this.app.post.bind(this.app);
    this.patch = this.app.patch.bind(this.app);
    this.put = this.app.put.bind(this.app);
    this.delete = this.app.delete.bind(this.app);
    this.use = this.app.use.bind(this.app);
    this.all = this.app.all.bind(this.app);
  }

  start() {
    if (this.server) return;
    this.server = this.app.listen(this.config.port);
    this.ctx.logger.label('server').info(`server start at http://127.0.0.1:${this.config.port}`);
  }

  stop() {
    if (!this.server) return;
    this.server.close();
  }

  get: Server['app']['get'];

  post: Server['app']['post'];

  patch: Server['app']['patch'];

  put: Server['app']['put'];

  delete: Server['app']['delete'];

  all: Server['app']['all'];

  use: Server['app']['use'];

  router = express.Router;

  json = express.json;

  static = express.static;
}

export default Server;
