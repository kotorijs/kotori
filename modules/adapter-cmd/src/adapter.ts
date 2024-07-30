/*
 * @Author: Hotaru biyuehuya@gmail.com
 * @Blog: https://hotaru.icu
 * @Date: 2023-09-29 14:31:09
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2024-07-30 19:49:25
 */
import { Adapter, type AdapterConfig, type Context, MessageScope, Tsu } from 'kotori-bot'
import CmdApi from './api'
import CmdElements from './elements'

export const config = Tsu.Object({
  nickname: Tsu.String().default('Kotarou'),
  'self-nickname': Tsu.String().default('KotoriO'),
  'self-id': Tsu.String().default('720')
})

type CmdConfig = Tsu.infer<typeof config> & AdapterConfig

export class CmdAdapter extends Adapter<CmdApi, CmdConfig, CmdElements> {
  private messageId = ''

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
      messageId: this.messageId,
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
    process.stdout.write(`${this.config['self-nickname']} > ${(params as { message: string }).message} \r\n`)
    this.messageId += 1
    this.ctx.emit('send', {
      api: this.api,
      messageId: this.messageId
    })
  }
}

export default CmdAdapter
