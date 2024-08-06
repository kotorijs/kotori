import '../types'
import { type LoggerData, Transport, type Context } from 'kotori-bot'

export default function (ctx: Context) {
  return class WebuiTransport extends Transport {
    public handle(data: LoggerData) {
      ctx.emit('console_output', data)
    }
  }
}
