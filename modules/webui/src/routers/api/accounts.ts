import { Context } from '../../types';

export default (ctx: Context, app: Context['server']) => {
  const router = app.router();

  router.post('/login', (req, res) => {
    const { username, password } = req.body;
    const loginStats = ctx.webui.getLoginStats();

    if (ctx.webui.checkVerifyHash(username, password)) {
      ctx.logger.label('server').trace('Login successful');
      loginStats.success += 1;
      ctx.webui.setLoginStats(loginStats);
      return res.json({ token: ctx.webui.addToken() });
    }
    ctx.logger.label('server').trace('Login failed');
    loginStats.failed += 1;
    ctx.webui.setLoginStats(loginStats);
    return res.status(401).json({ message: 'Invalid username or password' });
  });

  router.post('/logout', (req, res) => {
    ctx.webui.removeToken(req.headers.authorization ?? '');
    res.sendStatus(204);
  });

  return router;
};
