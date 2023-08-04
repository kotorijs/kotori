/*
 * @Author: Hotaru biyuehuya@gmail.com
 * @Blog: http://imlolicon.tk
 * @Date: 2023-07-15 16:09:28
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2023-07-30 16:06:59
 */
import os from 'os';
import Express from 'express';
import { CONST, getPackageInfo } from "@/tools";
import { dealCpu, dealRam, dealTime, dealEnv } from "../../kotori-bot/method";
import { handle, verify } from '../method';
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
    handle(res, dealEnv(), 500);
});

route.get('/config', (req, res) => {
    if (verify(<string>req.query.token)) { handle(res, null, 504); return; }
    handle(res, {
        content: readFileSync(`${CONST.ROOT_PATH}\\config.yml`).toString()
    }, 500);
})

export default route;