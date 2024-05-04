import account from './api/accounts';
import config from './api/config';
import data from './api/data';

export default [
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
];
