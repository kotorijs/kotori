import { Context } from '../types';
import RouterConfig from './router';

/* eslint-disable-next-line func-names */
export default function (ctx: Context, app: Context['server']) {
  const router = app.router();
  RouterConfig.forEach((page) => {
    router.use(page.path, page.handler(ctx, app));
  });
  return router;
}
