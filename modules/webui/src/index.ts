import { Tsu } from 'kotori-bot';
import path from 'path';
import { Context } from './types';
import { Webui, config } from './utils/webui';
import routers from './routers';
import ws from './ws';
import router from './routers/router';

export const inject = ['server', 'file', 'cache'];

export { config } from './utils/webui';

export function main(ctx: Context, cfg: Tsu.infer<typeof config>) {
  /* Starts webui service */
  ctx.service('webui', new Webui(ctx, cfg));
  ctx.inject('webui');
  ctx.on('ready', () => {
    ws(ctx, ctx.server.wss('/webui')!);
  });

  /* Sets up routes */
  const app = ctx.server;
  app.use(app.static(path.resolve(__dirname, '../dist')));
  app.use(app.json());
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  app.all('*', (req: any, res: any, next: any) => {
    ctx.logger.label(req.method).trace(req.path);
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Methods', '*');
    res.header('Content-Type', 'application/json;charset=utf-8');

    if (!router.find((item) => item.path === req.path || req.path.startsWith(item.path))) return res.status(404).send();
    if (req.path === '/api/accounts/login' || ctx.webui.checkToken(req.headers.authorization)) return next();
    return res.status(401);
  });
  app.use('/', routers(ctx, app));
}
