import { Context } from '../types';
import RouterConfig from './router';

export default (ctx: Context, app: Context['server']) => {
  const router = app.router();

  router.all('*', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.header('Access-Control-Allow-Methods', '*');
    res.header('Content-Type', 'application/json;charset=utf-8');

    if (req.method === 'OPTIONS') return res.sendStatus(200);
    ctx.logger.label(req.method).trace(req.path);

    if (!RouterConfig.find((item) => item.path === req.path || req.path.startsWith(item.path)))
      return res.sendStatus(404);
    if (req.path === '/api/accounts/login' || ctx.webui.checkToken(req.headers.authorization)) return next();
    return res.sendStatus(401);
  });

  RouterConfig.forEach((page) => {
    router.use(page.path, page.handler(ctx, app));
  });

  return router;
};
