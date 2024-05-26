import { Context, Service, Symbols } from '@kotori-bot/core';
import { Server as HttpServer, IncomingMessage, ServerResponse, createServer } from 'node:http';
import { match } from 'path-to-regexp';
import express from 'express';
import Ws from 'ws';
import { HttpRouteHandler, HttpRoutes, WsRouteHandler } from '../types/server';

interface ServerConfig {
  port: number;
}

interface BodyParserOptions {
  inflate?: boolean | undefined;
  limit?: number | string | undefined;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  type?: string | string[] | ((req: IncomingMessage) => any) | undefined;
  verify?(req: IncomingMessage, res: ServerResponse, buf: Buffer, encoding: string): void;
}

interface UrlencodedOptions extends BodyParserOptions {
  extended?: boolean | undefined;
  parameterLimit?: number | undefined;
}

interface ServeStaticOptions<R extends ServerResponse = ServerResponse> {
  acceptRanges?: boolean | undefined;
  cacheControl?: boolean | undefined;
  dotfiles?: string | undefined;
  etag?: boolean | undefined;
  extensions?: string[] | false | undefined;
  fallthrough?: boolean | undefined;
  immutable?: boolean | undefined;
  index?: boolean | string | string[] | undefined;
  lastModified?: boolean | undefined;
  maxAge?: number | string | undefined;
  redirect?: boolean | undefined;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  setHeaders?: ((res: R, path: string, stat: any) => any) | undefined;
}

interface RouterOptions {
  caseSensitive?: boolean | undefined;
  /**
   * @default false
   * @since 4.5.0
   */
  mergeParams?: boolean | undefined;
  strict?: boolean | undefined;
}

export class Server extends Service<ServerConfig> implements HttpRoutes {
  private app;

  private server: HttpServer;

  private wsServer: Ws.Server;

  private wsRoutes: Map<string, Set<WsRouteHandler>> = new Map();

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
      for (const [template, list] of this.wsRoutes.entries()) {
        if (!req.url) continue;
        const result = match(template, { decode: decodeURIComponent })(req.url);
        if (!result) continue;
        if (!triggered) triggered = true;
        list.forEach((callback) => {
          callback(ws, Object.assign(req, { params: result.params as Record<string, string> }));
        });
      }
      /* eslint-enable no-restricted-syntax,no-continue */
      if (!triggered) ws.close(1002);
    });
  }

  public start() {
    this.server.listen(this.config.port, () => {
      this.ctx.logger.label('server').info(`http server start at http://127.0.0.1:${this.config.port}`);
      this.ctx.logger.label('server').info(`websocket server start at ws://127.0.0.1:${this.config.port}`);
    });
  }

  public stop() {
    this.wsServer.close();
    this.server.close();
  }

  public get<P extends string>(path: P, ...callback: HttpRouteHandler<P>[]) {
    this.app.get(path, ...callback);
  }

  public post<P extends string>(path: P, ...callback: HttpRouteHandler<P>[]) {
    this.app.post(path, ...callback);
  }

  public patch<P extends string>(path: P, ...callback: HttpRouteHandler<P>[]) {
    this.app.patch(path, ...callback);
  }

  public put<P extends string>(path: P, ...callback: HttpRouteHandler<P>[]) {
    this.app.put(path, ...callback);
  }

  public delete<P extends string>(path: P, ...callback: HttpRouteHandler<P>[]) {
    this.app.delete(path, ...callback);
  }

  public all<P extends string>(path: P, ...callback: HttpRouteHandler<P>[]) {
    this.app.all(path, ...callback);
  }

  public use<P extends string>(
    path: P | HttpRouteHandler | HttpRoutes,
    ...callback: (HttpRouteHandler<P> | HttpRoutes)[]
  ) {
    if (typeof path === 'string') this.app.use(path, ...(callback as HttpRouteHandler<P>[]));
    else this.app.use('/', path as HttpRouteHandler<'/'>, ...(callback as HttpRouteHandler<P>[]));
  }

  public router = express.Router as (options?: RouterOptions) => HttpRoutes;

  public json = express.json as (options?: BodyParserOptions) => HttpRouteHandler;

  public static = express.static as (root: string, options?: ServeStaticOptions) => HttpRouteHandler;

  public urlencoded = express.urlencoded as (options?: UrlencodedOptions) => HttpRouteHandler;

  public wss<P extends string>(path: P, callback: WsRouteHandler<P>) {
    const list = this.wsRoutes.get(path) || new Set();
    list.add(callback as unknown as WsRouteHandler);
    this.wsRoutes.set(path, list);
    return () => list.delete(callback as unknown as WsRouteHandler);
  }
}

export default Server;
