import { DEFAULT_PASSWORD, DEFAULT_USERNAME } from '../../constant';
import { Context } from '../../types';

/* eslint-disable-next-line func-names */
export default function (ctx: Context, app: Context['server']) {
  const router = app.router();

  router.post('/login', (req, res) => {
    const { username: user, password: pwd } = req.body;
    const { username, password } = ctx.webui.config;
    const loginStats = ctx.webui.getLoginStats();

    if (user === username && pwd === password) {
      ctx.logger.label('server').trace('Login successful');
      loginStats.success += 1;
      ctx.webui.setLoginStats(loginStats);
      ctx.webui.updateToken();
      return res.json({
        token: ctx.webui.getToken(),
        isDefault: username + password === DEFAULT_USERNAME + DEFAULT_PASSWORD
      });
    }
    ctx.logger.label('server').trace('Login failed');
    loginStats.failed += 1;
    ctx.webui.setLoginStats(loginStats);
    return res.status(401).json({ message: 'Invalid username or password' });
  });

  router.post('/logout', (_, res) => {
    ctx.webui.updateToken();
    res.sendStatus(204);
  });

  return router;
}
