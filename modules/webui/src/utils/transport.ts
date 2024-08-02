import '../types'
import { LoggerData, Transport, none } from 'kotori-bot'

export default class WebuiTransport extends Transport {
  public handle(data: LoggerData) {
    none(this)
    ctx.emit('console_output', data)
  }
}
