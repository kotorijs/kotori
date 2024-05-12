import { Context, Service, Symbols } from '@kotori-bot/core';
import express from 'express';
import { IncomingMessage } from 'node:http';
import ws from 'ws';

interface ServerConfig {
  port: number;
}

export class Server extends Service<ServerConfig> {
  private app: ReturnType<typeof express>;

  private server?: ReturnType<ReturnType<typeof express>['listen']>;

  private wsServer?: ws.Server;

  public constructor(ctx: Context, config: ServerConfig) {
    super(ctx, config, 'server');

    this.app = express();
    this.app.use('/', (req, res, next) => {
      let isWebui = false;
      ctx[Symbols.modules].forEach((module) => {
        if (isWebui) return;
        if (module[0].pkg.name === '@kotori-bot/kotori-plugin-webui') isWebui = true;
      });
      if (isWebui || req.url !== '/') {
        next();
        return;
      }
      res.setHeader('Content-type', 'text/html');
      res.send(/* html */ `<h1>Welcome to kotori!</h1>`);
    });

    this.get = this.app.get.bind(this.app);
    this.post = this.app.post.bind(this.app);
    this.patch = this.app.patch.bind(this.app);
    this.put = this.app.put.bind(this.app);
    this.delete = this.app.delete.bind(this.app);
    this.use = this.app.use.bind(this.app);
    this.all = this.app.all.bind(this.app);
  }

  public start() {
    if (!this.server) {
      this.server = this.app.listen(this.config.port);
      this.ctx.logger.label('server').info(`http server start at http://127.0.0.1:${this.config.port}`);
    }
    if (!this.wsServer) {
      const port = this.config.port + 1;
      this.wsServer = new ws.Server({ port });
      this.ctx.logger.label('server').info(`websocket server start at ws://127.0.0.1:${port}`);
    }
  }

  public stop() {
    if (this.server) this.server.close();
    if (this.wsServer) this.wsServer.close();
  }

  public get: Server['app']['get'];

  public post: Server['app']['post'];

  public patch: Server['app']['patch'];

  public put: Server['app']['put'];

  public delete: Server['app']['delete'];

  public all: Server['app']['all'];

  public use: Server['app']['use'];

  public router = express.Router;

  public json = express.json;

  public static = express.static;

  public wss(path?: string) {
    if (!this.wsServer) return undefined;
    if (!path) return this.wsServer;
    const eventEmiter = new Proxy(this.wsServer.on, {
      apply: (target, thisArg, argArray) => {
        const [event, callback] = argArray;
        if (event !== 'connection') return Reflect.apply(target, thisArg, argArray);
        return this.wsServer!.on(event, (ws: ws, req: IncomingMessage) => {
          if (req.url !== path && path) return;
          callback(ws, req);
          this.ctx.logger.label('server').info(`websocket connection from ${req.url}`);
        });
      }
    });
    return new Proxy(this.wsServer, {
      get: (target, p, receiver) => {
        if (p !== 'on') return Reflect.get(target, p, receiver);
        return eventEmiter;
      }
    });
  }
}

export default Server;
