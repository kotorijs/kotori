import { Tsu, loadConfig } from 'kotori-bot';
import path, { resolve } from 'node:path';
import { Context } from './types';
import { Webui, config } from './service';
import routers from './routers';
import wsHandler from './ws';
import plugin from './plugin';

export const inject = ['server', 'file', 'cache'];

export { config } from './service';

export function main(ctx: Context, cfg: Tsu.infer<typeof config>) {
  /* Starts webui service */
  ctx.service('webui', new Webui(ctx, cfg));
  ctx.inject('webui');
  ctx.on('ready', () => {
    ctx.server.wss('/webui', (ws) => {
      wsHandler(ctx, ws);
    });
  });

  /* Sets up routes */
  const app = ctx.server;
  app.use(app.static(path.resolve(__dirname, '../dist')));
  app.use(app.json());
  app.use(app.urlencoded({ extended: true }));
  app.use('/', routers(ctx, app));

  /* Register plugin */
  ctx.load({
    /* extends parent plugin's package name and share the same data files area */
    name: loadConfig(resolve(__dirname, '../package.json')).name as string,
    main: (subCtx) => {
      plugin(subCtx);
    }
  });
}
