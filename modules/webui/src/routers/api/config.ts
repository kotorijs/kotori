import type { Context } from 'kotori-bot'

export default (ctx: Context, app: Context['server']) => {
  const router = app.router()

  router.get('/plugins/:scope?/:name?', (req, res) => {
    const { scope, name } = req.params
    const result = ctx.webui.configPluginsGet(scope, name)
    return result ? res.json(result) : res.status(404).json({ message: 'Plugin not found' })
  })

  router.put('/plugins/:scope/:name?', (req, res) => {
    const { scope, name } = req.params
    const { body } = req
    if (typeof body !== 'object') return res.status(400).json({ message: 'Invalid body' })
    const result = ctx.webui.configPluginUpdate(body, scope, name)
    return result ? res.sendStatus(204) : res.status(404).json({ message: 'Plugin not found' })
  })

  router.get('/bots/:name?', (req, res) => {
    const { name } = req.params
    const result = ctx.webui.configBotsGet(name)
    return result ? res.json(result) : res.status(404).json({ message: 'Bot not found' })
  })

  router.put('/bots/:name', (req, res) => {
    const { name } = req.params
    const { body } = req
    if (typeof body !== 'object') return res.status(400).json({ message: 'Invalid body' })
    const result = ctx.webui.configBotsUpdate(body, name)
    return result ? res.sendStatus(204) : res.status(404).json({ message: 'Bot not found' })
  })

  router.get('/global', (_, res) => {
    res.json(ctx.config.global)
  })

  router.put('/global', (req, res) => {
    const { body } = req
    if (typeof body !== 'object') return res.status(400).json({ message: 'Invalid body' })
    ctx.webui.configGlobalUpdate(body)
    return res.sendStatus(204)
  })

  router.get('/commands/:name?', async (req, res) => {
    const { name } = req.params
    const result = await ctx.webui.configCommandsGet(name)
    return result ? res.json(result) : res.status(404).json({ message: 'Command not found' })
  })

  router.put('/commands/:name', async (req, res) => {
    const { name } = req.params
    const { body } = req
    if (typeof body !== 'object') return res.status(400).json({ message: 'Invalid body' })
    const result = await ctx.webui.configCommandsUpdate(body, name)
    return result ? res.sendStatus(204) : res.status(404).json({ message: 'Command not found' })
  })

  return router
}
