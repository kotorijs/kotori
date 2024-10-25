import { type Api, Adapter as OriginAdapter, KotoriError, type Elements, type AdapterConfig } from '@kotori-bot/core'
import type { WsRouteHandler } from '../types/server'

export namespace Adapters {
  export abstract class WebSocket<
    T extends Api = Api,
    D extends AdapterConfig = AdapterConfig,
    E extends Elements = Elements
  > extends OriginAdapter<T, D, E> {
    private isSetup = false

    private destroyFn?: () => void

    private wssPath = `/adapter/${this.identity}`

    private wssAddress = `ws://127.0.0.1:${this.ctx.config.global.port}${this.wssPath}`

    protected destroy() {
      if (!this.destroyFn) return
      this.destroyFn()
      this.isSetup = false
    }

    protected setup() {
      if (this.isSetup) return
      this.ctx.inject('server')

      this.destroyFn = this.ctx.server.wss(this.wssPath, (ws, req) => {
        if (this.connection) this.connection(ws, req)
        ws.on('message', (raw) => {
          let data: undefined
          try {
            data = JSON.parse(raw.toString())
          } catch (e) {
            throw new KotoriError(
              `Data parse error: ${e instanceof Error ? e.message : e}`,
              this.ctx.identity?.toString()
            )
          }
          if (data) this.handle(data)
        })
        ws.on('close', () => {
          this.offline()
          this.ctx.emit('connect', {
            type: 'disconnect',
            mode: 'ws-reverse',
            adapter: this,
            normal: false,
            address: this.wssAddress
          })
        })
      })
      this.isSetup = true
      this.ctx.emit('connect', {
        type: 'connect',
        mode: 'ws-reverse',
        adapter: this,
        normal: true,
        address: this.wssAddress
      })
    }

    public abstract handle(...data: unknown[]): void

    public connection?: (ws: Parameters<WsRouteHandler>[0], req: Parameters<WsRouteHandler>[1]) => void

    public start() {
      this.setup()
    }

    public stop() {
      this.destroy()
      this.offline()
      this.ctx.emit('connect', {
        type: 'disconnect',
        mode: 'ws-reverse',
        adapter: this,
        normal: false,
        address: this.wssAddress
      })
    }
  }
}

export default Adapters
