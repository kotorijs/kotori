/*
 * @Author: Hotaru biyuehuya@gmail.com
 * @Blog: https://hotaru.icu
 * @Date: 2023-09-29 14:31:09
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2024-08-05 16:27:49
 */
import { type AdapterConfig, type Context, Tsu, Adapters } from 'kotori-bot'
import SandboxApi from './api'
import SandboxElements from './elements'
import { type ActionList, eventDataSchema, responseSchema } from './type'

declare module 'kotori-bot' {
  interface EventsMapping {
    literal_sandbox_response(res: Tsu.infer<typeof responseSchema>): void
  }
}

export const config = Tsu.Object({})

type SandboxConfig = Tsu.infer<typeof config> & AdapterConfig

export class SandboxAdapter extends Adapters.WebSocket<SandboxApi, SandboxConfig, SandboxElements> {
  private wsSend?: (data: string) => void

  public readonly config: SandboxConfig

  public readonly api: SandboxApi = new SandboxApi(this)
  public readonly elements: SandboxElements = new SandboxElements(this)

  public readonly platform = 'sandbox'

  public constructor(ctx: Context, config: SandboxConfig, identity: string) {
    super(ctx, config, identity)
    this.config = config
  }

  public handle(data: object) {
    if ('response' in data) {
      const result = responseSchema.parseSafe(data)
      if (result.value) {
        this.ctx.emit('literal_sandbox_response', result.data)
      } else {
        this.send({ action: 'on_data_error', error: result.error.message })
      }
      return
    }
    const result = eventDataSchema.parseSafe(data)
    if (result.value) {
      // biome-ignore lint:
      this.session(result.data.event, result.data as any)
    } else {
      this.send({ action: 'on_data_error', error: result.error.message })
    }
  }

  public start() {
    this.connection = (ws) => {
      this.wsSend = ws.send.bind(ws)
    }
  }

  public send(data: ActionList) {
    this.wsSend?.(JSON.stringify(data))
  }
}

export default SandboxAdapter
