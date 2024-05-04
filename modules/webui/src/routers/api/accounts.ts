import { DEFAULT_PASSWORD, DEFAULT_USERNAME } from '../../constant';
import { Context } from '../../types';

/* eslint-disable-next-line func-names */
export default function (ctx: Context, app: Context['server']) {
  const router = app.router();

  router.post('/login', (req, res) => {
    const { username: user, password: pwd } = req.body;
    const { username, password } = ctx.webui.config;

    if (user === username && pwd === password) {
      ctx.webui.updateToken();
      return res.json({
        token: ctx.webui.generateToken,
        isDefault: username + password === DEFAULT_USERNAME + DEFAULT_PASSWORD
      });
    }
    return res.status(401).json({ code: 401, message: 'Invalid username or password' });
  });

  router.post('/logout', (_, res) => {
    ctx.webui.updateToken();
    res.status(204).send();
  });

  return router;
}
