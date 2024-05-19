import { Context } from '../types';
import RouterConfig from './router';

export default (ctx: Context, app: Context['server']) => {
  const router = app.router();
  RouterConfig.forEach((page) => {
    router.use(page.path, page.handler(ctx, app));
  });
  return router;
};
