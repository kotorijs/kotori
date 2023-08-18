import { expressApp } from '../interface';
import account from './account';
import data from './data';
import log from './log';
import plugin from './plugin';

export default (app: expressApp) => {
	app.use('/api/account', account);
	app.use('/api/data', data);
	app.use('/api/log', log);
	app.use('/api/plugin', plugin);
};
