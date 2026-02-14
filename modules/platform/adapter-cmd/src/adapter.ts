import { Adapter, type AdapterConfig, type Context, type LoggerData, MessageScope, Tsu } from 'kotori-bot'
import CmdApi from './api'
import CmdElements from './elements'

declare module 'kotori-bot' {
  interface EventsMapping {
    console_output(data: LoggerData | { msg: string }): void
  }
}
export const config = Tsu.Object({
  nickname: Tsu.String().default('Kotarou').describe("User's nickname"),
  'self-nickname': Tsu.String().default('KotoriO').describe("Bot's nickname"),
  'self-id': Tsu.String().default('720').describe("Bot's id")
})

type CmdConfig = Tsu.infer<typeof config> & AdapterConfig

export class CmdAdapter extends Adapter<CmdApi, CmdConfig, CmdElements> {
  public messageId = 0

  public readonly platform = 'cmd'

  public readonly api: CmdApi

  public readonly elements: CmdElements

  public constructor(ctx: Context, config: CmdConfig, identity: string) {
    super(ctx, config, identity)
    this.api = new CmdApi(this)
    this.elements = new CmdElements(this)
    this.selfId = config['self-id']
    process.stdin.on('data', (data) => this.handle(data))
  }

  public handle(data: Buffer) {
    if (this.status.value !== 'online') return
    let message = data.toString()
    if (message === '\n' || message === '\r\n') return
    message = message.replace('\r\n', '').replace('\n', '')
    this.session('on_message', {
      type: MessageScope.PRIVATE,
      messageId: String(this.messageId),
      message,
      messageAlt: message,
      userId: this.config.master,
      sender: {
        nickname: this.config.nickname
      },
      time: Date.now()
    })
    this.messageId += 1
  }

  public start() {
    this.ctx.emit('connect', {
      type: 'connect',
      adapter: this,
      normal: true,
      mode: 'other',
      address: 'command line'
    })
    this.online()
  }

  public stop() {
    this.ctx.emit('connect', {
      type: 'disconnect',
      adapter: this,
      normal: true,
      mode: 'other',
      address: 'command line'
    })
    this.offline()
  }

  public send(action: string, params?: object) {
    if (this.status.value !== 'online' || action !== 'send_private_msg' || !params) return
    if (typeof (params as { message: string }).message !== 'string') return
    if ((params as { user_id: unknown }).user_id !== this.config.master) return
    const msg = `${this.config['self-nickname']} > ${(params as { message: string }).message} \r\n`
    process.stdout.write(msg)
    this.ctx.emit('console_output', { msg })
    this.messageId += 1
  }
}

export default CmdAdapter
