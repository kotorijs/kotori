/*
 * @Author: Hotaru biyuehuya@gmail.com
 * @Blog: https://hotaru.icu
 * @Date: 2023-09-29 14:31:09
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2024-08-07 19:07:55
 */
import { type AdapterConfig, Adapters, type Context, MessageScope, Tsu, stringTemp, KotoriError } from 'kotori-bot'
import Mcwss from 'mcwss'
import WebSocket from 'ws'
import McApi from './api'
import McElements from './elements'

export const config = Tsu.Object({
  nickname: Tsu.String().default('Romi').describe("Bot's name"),
  template: Tsu.Union(Tsu.Null(), Tsu.String())
    .default('<%nickname%> %msg%')
    .describe('The template of bot sent message ')
})

type McConfig = Tsu.infer<typeof config> & AdapterConfig

type MessageData = Parameters<Mcwss['on']> extends [unknown, infer F]
  ? F extends (data: infer D) => void
    ? D extends { header: { eventName: 'PlayerMessage' } }
      ? D
      : never
    : never
  : never

export class McAdapter extends Adapters.WebSocket<McApi, McConfig, McElements> {
  private clients: Record<string, MessageData['client']> = {}

  public messageId = 1

  public readonly config: McConfig

  public readonly platform = 'minecraft'

  public readonly api: McApi = new McApi(this)

  public readonly elements: McElements = new McElements(this)

  public constructor(ctx: Context, config: McConfig, identity: string) {
    super(ctx, config, identity)
    this.config = config
    this.connection = (ws, req) => {
      const fakeServer = new WebSocket.Server({ noServer: true })
      const app = new Mcwss({ server: fakeServer as unknown as number })
      app.on('error', (err) => this.ctx.emit('error', KotoriError.from(err.error, this.ctx.identity?.toString())))
      app.on('connection', (data) => {
        this.online()
        this.clients[data.client.sessionId] = data.client
      })
      app.on('player_message', (data) => this.onMessage(data))
      app.start()
      fakeServer.emit('connection', ws, req)
    }
  }

  public override handle() {
    this.handle.toString()
  }

  public onMessage(data: MessageData) {
    if (data.body.type === 'chat') {
      this.session('on_message', {
        type: MessageScope.GROUP,
        messageId: String(this.messageId),
        message: data.body.message,
        userId: `${data.client.sessionId}@${data.body.sender}`,
        sender: {
          nickname: data.body.sender,
          role: 'member'
        },
        messageAlt: data.body.message,
        groupId: data.client.sessionId.toString(),
        time: Date.now()
      })
    } else {
      this.session('on_message', {
        type: MessageScope.PRIVATE,
        messageId: String(this.messageId),
        message: data.body.message,
        userId: `${data.client.sessionId}@${data.body.sender}`,
        sender: {
          nickname: data.body.sender
        },
        messageAlt: data.body.message,
        time: Date.now()
      })
    }

    this.ctx.emit('send', {
      api: this.api,
      messageId: this.messageId.toString()
    })
    this.messageId += 1
  }

  public override send(action: string, params: { msg: string }) {
    const [sessionId, playerName] = action.split('@')
    const { msg } = params
    if (!(sessionId in this.clients)) return
    if (playerName) {
      this.clients[sessionId].run(['msg', `@a[name="${playerName}"]`, msg])
    } else if (this.config.template) {
      this.clients[sessionId].chatf(stringTemp(this.config.template, { nickname: this.config.nickname, msg }))
    } else {
      this.clients[sessionId].chat(msg)
    }
  }
}

export default McAdapter
