import { Context } from '../../types';

export default (ctx: Context, app: Context['server']) => {
  const router = app.router();

  return router;
};
