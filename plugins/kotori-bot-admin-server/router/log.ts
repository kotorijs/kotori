import Express from 'express';
import { handle, verify } from '../method';
import { existsSync, readFileSync, readdirSync } from 'fs';
import { _const } from '@/function';

const LOG_PATH = `${_const._LOGS_PATH}\\`;
const route = Express.Router();

route.get('/list', (req, res) => {
    if (verify(<string>req.query.token)) { handle(res, null, 504); return; } 
    const list = readdirSync(LOG_PATH);
    list.shift();
    handle(res, list.reverse(), 500);
})

route.get('/view', (req, res) => {
    if (verify(<string>req.query.token)) { handle(res, null, 504); return; } 
    let num: number | string = <string>req.query.num;
    num = parseInt(<string>num);

    const list = readdirSync(LOG_PATH);
    list.shift();
    list.reverse();
    let path = `${LOG_PATH}\\${list[num]}`;
    if (!existsSync(path)) {
        handle(res, null, 502);
        return;
    }

    try {
        handle(res, { file: list[num], content: readFileSync(path).toString() }, 500);
    } catch (error) {
        console.error(error);
        handle(res, null, 503);
    }
});

export default route;