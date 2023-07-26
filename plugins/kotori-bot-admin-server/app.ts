namespace app { };

import Express from "express";
import { Api, Const, Event, PluginData, PluginInfo } from "@/interface";
import config from "./config";
import { handle, log, updateToken, verify } from './method';
import router from "./router";
import { expressApp } from "./interface";
import bot from './bot';
import { _const } from "@/function";
import path from "path";

updateToken();
const SHARE = {
    Status: <Const>{},
    PluginData: <PluginData[]>[],
};

const app = Express();

app.use(Express.static(path.join(_const._ROOT_PATH, '/web')));
app.use(Express.json());

app.all('*', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Methods', '*');
    res.header('Content-Type', 'application/json;charset=utf-8');
    next();
});

app.get('/api/data/bot', (req, res) => {
    if (verify(<string>req.query.token)) { handle(res, null, 504); return; }
    handle(res, SHARE.Status._BOT, 500);
});

app.get('/api/plugin/info', (req, res) => {
    if (verify(<string>req.query.token)) { handle(res, null, 504); return; }
    const Plugins: { name: string, src: string, info: PluginInfo | undefined }[] = new Array;
    SHARE.PluginData.forEach(element => {
        Plugins.push({
            name: element[1],
            src: element[2].split('..')[1].replace(/\\/g, '/'),
            info: element[3]
        })
    });
    handle(res, Plugins, 500);
});

router(app as unknown as expressApp);
app.listen(config.port, () => log(`Express server listening at http://127.0.0.1:${config.port}`));

export default (Event: Event, Api: Api, Const: Const, Plugins: PluginData[]) => {
    SHARE.Status = Const;
    SHARE.PluginData = Plugins;
    bot(Event, Api, Const);
}
