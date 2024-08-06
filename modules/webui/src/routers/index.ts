import type { Context } from 'kotori-bot'
import RouterConfig from './router'

const NO_VERIFY = ['/api/accounts/login', '/api/data/avatar/']

export default (ctx: Context, app: Context['server']) => {
  const router = app.router()

  router.all('*', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    res.header('Access-Control-Allow-Methods', '*')
    res.header('Content-Type', 'application/json;charset=utf-8')

    if (req.method === 'OPTIONS') return res.sendStatus(200)
    ctx.logger.label(req.method).trace(req.path)

    if (!RouterConfig.find((item) => item.path === req.path || req.path.startsWith(item.path)))
      return res.sendStatus(404)
    if (
      NO_VERIFY.filter((item) => req.path.startsWith(item)).length > 0 ||
      ctx.webui.checkToken(req.headers.authorization)
    ) {
      return next()
    }
    return res.sendStatus(401)
  })

  for (const page of RouterConfig) router.use(page.path, page.handler(ctx, app))
  return router
}
