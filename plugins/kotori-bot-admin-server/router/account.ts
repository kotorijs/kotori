import Express from 'express';
import { handle, loadConfigP, saveConfigP } from '../method';
import { getRandomStr } from '@/function';
import config from '../config';

const route = Express.Router();


route.get('/login', (req, res) => {
    const { user, pwd } = req.query;
    if (user === config.account.user && pwd === config.account.pwd) {
        saveConfigP('token.json', { token: getRandomStr() });
        handle(res, <object>loadConfigP('token.json'), 500);
    } else {
        handle(res, null, 502);
    }
});

export default route;