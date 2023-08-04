import Express from 'express';
import { handle, loadConfigP, updateToken } from '../method';
import config from '../config';
import { Token } from '../interface';
const route = Express.Router();

route.get('/login', (req, res) => {
    const { user, pwd } = req.query;
    if (user === config.web.user && pwd === config.web.pwd) {
        updateToken()
        handle(res, <Token>loadConfigP('token.json'), 500);
    } else {
        handle(res, null, 502);
    }
});

export default route;