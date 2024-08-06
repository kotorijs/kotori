import type { Context } from 'kotori-bot'

export default (ctx: Context, app: Context['server']) => {
  const router = app.router()

  router.get('/modules/:scope?/:name?', (req, res) => {
    const { scope, name } = req.params
    const result = ctx.webui.dataModules(scope, name)
    return result ? res.json(result) : res.status(404).json({ message: 'Modules not found' })
  })

  router.get('/bots/:name?', (req, res) => {
    const { name } = req.params
    const result = ctx.webui.dataBots(name)
    return result ? res.json(result) : res.status(404).json({ message: 'Bot not found' })
  })

  router.get('/stats', async (_, res) => {
    res.json(await ctx.webui.dataStats())
  })

  router.get('/status', (_, res) => {
    res.json(ctx.webui.dataStatus())
  })

  router.get('/avatar/:scope?/:name?', (req, res) => {
    const { scope, name } = req.params
    res.type('image/svg+xml').send(ctx.webui.dataAvatar(scope, name))
  })

  return router
}
