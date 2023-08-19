import path from 'path';
import Express from 'express';
import type { Api, Const, Event, PluginData, PluginInfo } from '@/tools';
import { CONST } from '@/tools';
import config from './config';
import { handle, con, updateToken, verify, log } from './method';
import router from './router';
import { expressApp } from './interface';
import './bot';

updateToken();
const SHARE = {
	Status: <Const>{},
	PluginData: <PluginData[]>[],
};

const app = Express();

app.use(Express.static(path.join(CONST.ROOT_PATH, '/web')));
app.use(Express.json());

app.all('*', (req, res, next) => {
	log(req.path, req.method as 'GET' | 'POST');
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Content-Type');
	res.header('Access-Control-Allow-Methods', '*');
	res.header('Content-Type', 'application/json;charset=utf-8');
	next();
});

app.get('/api/data/bot', (req, res) => {
	if (verify(<string>req.query.token)) {
		handle(res, null, 504);
		return;
	}
	handle(res, SHARE.Status.BOT, 500);
});

app.get('/api/plugin/info', (req, res) => {
	if (verify(<string>req.query.token)) {
		handle(res, null, 504);
		return;
	}
	const Plugins: { name: string; src: string; info: PluginInfo | undefined }[] = [];
	SHARE.PluginData.forEach(element => {
		Plugins.push({
			name: element[1],
			src: element[2].split('..')[1].replace(/\\/g, '/'),
			info: element[3],
		});
	});
	handle(res, Plugins, 500);
});

router(app as unknown as expressApp);
app.listen(config.port, () => con.log(`Express server listening at http://127.0.0.1:${config.port}`));

export default (_event: Event, _api: Api, consts: Const, plugins: PluginData[]) => {
	SHARE.Status = consts;
	SHARE.PluginData = plugins;
};
