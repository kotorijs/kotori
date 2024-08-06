import type { Tsu, Context } from 'kotori-bot'
import pkg from '../package.json'
import { resolve } from 'node:path'
import { Webui, type config } from './service'
import routers from './routers'
import wsHandler from './ws'
import plugin from './plugin'

export const inject = ['server', 'cache', 'database']

export const lang = [__dirname, '../locales']

export * from './service'

export function main(ctx: Context, cfg: Tsu.infer<typeof config>) {
  // Starts webui service
  ctx.service('webui', new Webui(ctx, cfg))
  ctx.inject('webui')
  ctx.on('ready', () => {
    ctx.server.wss('/webui/:token', (ws, { params: { token } }) => {
      if (!ctx.webui.checkToken(token)) return ws.close(1002)
      wsHandler(ctx, ws)
    })
  })

  // Sets up routes
  const app = ctx.server
  app.use(app.static(resolve(__dirname, '../dist')))
  app.use(app.json())
  app.use(app.urlencoded({ extended: true }))
  app.use('/', routers(ctx, app))

  // Register plugin
  ctx.load({
    // extends parent plugin's package name and share the same data files area
    name: pkg.name,
    main: (subCtx) => {
      plugin(subCtx)
    }
  })
}
