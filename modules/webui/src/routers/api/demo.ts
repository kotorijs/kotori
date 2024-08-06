import type { Context } from 'kotori-bot'

export default (_: Context, app: Context['server']) => {
  const router = app.router()

  return router
}
