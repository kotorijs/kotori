import Express from 'express';
import { handle, verify } from '../method';
import { existsSync, readFileSync } from 'fs';
import { _const } from '@/function';

enum LogOp {
    get,
    change,
    delete
}

const route = Express.Router();

route.get('/file', (req, res) => {
    if (verify(<string>req.query.token)) { handle(res, null, 504); return; } 
    let { path, op } = req.query;
    if (!path || !op) {
        handle(res, null, 501);
        return;
    }

    switch (LogOp[<string>op]) {
        default:
            if ((<string>path).includes('..')) {
                handle(res, null, 504);
                return;
            };
            path = `${_const._PLUGIN_PATH}\\${path}`;
            if (!existsSync(path)) {
                handle(res, null, 502);
                return;
            }

            try {
                handle(res, { content: readFileSync(path).toString() });
            } catch (error) {
                console.error(error);
                handle(res, null, 503);
            }
            break;
    }
});

export default route;