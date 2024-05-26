import { Context, HttpRoutes } from 'kotori-bot';
import account from './api/accounts';
import config from './api/config';
import data from './api/data';

interface RouterRecord {
  path: string;
  handler: (ctx: Context, app: Context['server']) => HttpRoutes;
}

function defineRouter(config: RouterRecord[]) {
  return config;
}

export default defineRouter([
  {
    path: '/api/accounts',
    handler: account
  },
  {
    path: '/api/config',
    handler: config
  },
  {
    path: '/api/data',
    handler: data
  }
]);
