import { Context } from '../../types';

/* eslint-disable-next-line func-names */
export default function (ctx: Context, app: Context['server']) {
  const router = app.router();

  return router;
}
