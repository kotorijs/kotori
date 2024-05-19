import { Context, Service, Symbols } from '@kotori-bot/core';
import { Server as HttpServer, IncomingMessage, createServer } from 'node:http';
import { match } from 'path-to-regexp';
import express from 'express';
import Ws from 'ws';

interface ServerConfig {
  port: number;
}

type CoreExpress = ReturnType<typeof express>;

type wsRouterCallback = (ws: Ws, req: IncomingMessage & { params: object }) => void;

export class Server extends Service<ServerConfig> {
  private app: CoreExpress;

  private server: HttpServer;

  private wsServer: Ws.Server;

  private wsRouters: Map<string, wsRouterCallback> = new Map();

  public constructor(ctx: Context, config: ServerConfig) {
    super(ctx, config, 'server');
    this.app = express();
    this.app.use(express.json());
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

    this.server = createServer(this.app);
    this.wsServer = new Ws.Server({ noServer: true });
    this.server.on('upgrade', (req, socket, head) => {
      this.wsServer.handleUpgrade(req, socket, head, (ws) => {
        this.wsServer.emit('connection', ws, req);
      });
    });
    this.wsServer.on('connection', (ws, req) => {
      let triggered = false;
      /* eslint-disable no-restricted-syntax,no-continue */
      for (const [template, callback] of this.wsRouters.entries()) {
        if (!req.url) continue;
        const result = match(template, { decode: decodeURIComponent })(req.url);
        if (!result) continue;
        if (!triggered) triggered = true;
        callback(ws, Object.assign(req, { params: result.params }));
      }
      /* eslint-enable no-restricted-syntax,no-continue */
      if (!triggered) ws.close(ws.CLOSED);
    });
  }

  public start() {
    this.server.listen(this.config.port, () => {
      this.ctx.logger.label('server').info(`http server start at http://127.0.0.1:${this.config.port}`);
    });
  }

  public stop() {
    this.wsServer.close();
    this.server.close();
  }

  public get: Server['app']['get'];

  public post: Server['app']['post'];

  public patch: Server['app']['patch'];

  public put: Server['app']['put'];

  public delete: Server['app']['delete'];

  public all: Server['app']['all'];

  public use: Server['app']['use'];

  public router = express.Router;

  public json = express.json as (options?: object) => () => unknown;

  public static = express.static as unknown as (path: string) => () => unknown;

  public urlencoded = express.urlencoded as (options?: object) => () => unknown;

  public wss(path: string, callback: wsRouterCallback) {
    this.wsRouters.set(path, callback);
  }
}

export default Server;
