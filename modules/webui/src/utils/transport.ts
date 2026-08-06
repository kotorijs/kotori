import '../types'
import { type Context, type LoggerData, Transport } from 'kotori-bot'

export default function (ctx: Context) {
  return class WebuiTransport extends Transport {
    public handle(data: LoggerData) {
      ctx.emit('console_output', data)
    }
  }
}
