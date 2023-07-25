import os from 'os';
import Express from 'express';
import { _const, getPackageInfo } from "@/function";
import { dealCpu, dealRam, dealTime } from "../../kotori-bot/method";
import { handle, verify } from '../method';
import { version as version_ts } from 'typescript';
import { VERSION as version_tsnode } from "ts-node";
import { readFileSync } from 'fs';

const route = Express.Router();

route.get('/kotori', (req, res) => {
    if (verify(<string>req.query.token)) { handle(res, null, 504); return; }
    handle(res, getPackageInfo(), 500);
});

route.get('/server', (req, res) => {
    if (verify(<string>req.query.token)) { handle(res, null, 504); return; }
    handle(res, {
        os: {
            type: os.type(),
            plate: os.platform(),
            time: dealTime(),
            hostname: os.hostname(),
            dir: os.homedir()
        },
        cpu: {
            arch: os.arch(),
            ...dealCpu()
        },
        ram: dealRam(),
        network: {
            num: Object.keys(os.networkInterfaces()).length
        }
    }, 500);
});

route.get('/env', (req, res) => {
    if (verify(<string>req.query.token)) { handle(res, null, 504); return; }
    handle(res, {
        node: process.versions.node,
        typescript: version_ts,
        tsnode: version_tsnode
    }, 500);
});

route.get('/config', (req, res) => {
    if (verify(<string>req.query.token)) { handle(res, null, 504); return; }
    handle(res, {
        content: readFileSync(`${_const._ROOT_PATH}\\config.yml`).toString()
    }, 500);
})

export default route;