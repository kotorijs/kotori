import type { Context } from 'kotori-bot'

export default (ctx: Context, app: Context['server']) => {
  const router = app.router()

  router.post('/login', async (req, res) => {
    const { username, password } = req.body
    const token = await ctx.webui.accountLogin(username, password)

    if (token) {
      ctx.logger.label('webui').record('user login successful')
      res.json({ token })
      return
    }

    ctx.logger.label('webui').error('user login failed')
    res.status(401).json({ message: 'Invalid username or password' })
  })

  router.post('/logout', (req, res) => {
    ctx.webui.accountLogout(req.headers.authorization ?? '')
    res.sendStatus(204)
  })

  return router
}
