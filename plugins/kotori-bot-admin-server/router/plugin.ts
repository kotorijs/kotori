/*
 * @Author: Hotaru biyuehuya@gmail.com
 * @Blog: http://imlolicon.tk
 * @Date: 2023-07-18 14:16:10
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2023-07-31 16:53:32
 */
import Express from 'express';
import { con, handle, verify } from '../method';
import { existsSync, readFileSync } from 'fs';
import { CONST } from '@/tools';

const route = Express.Router();

route.get('/file', (req, res) => {
    if (verify(<string>req.query.token)) { handle(res, null, 504); return; }
    let { path, op } = req.query;
    if (!path || !op) { handle(res, null, 501); return; }
    if ((<string>path).includes('..')) { handle(res, null, 504); return; };
    path = `${CONST.PLUGIN_PATH}\\${path}`;
    if (!existsSync(path)) { handle(res, null, 502); return;
    }

    try {
        handle(res, { content: readFileSync(path).toString() });
    } catch (error) {
        con.error(error);
        handle(res, null, 503);
    }

});

export default route;