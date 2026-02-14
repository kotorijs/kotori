import stringify from 'fast-safe-stringify'
import { type LoggerData, LoggerLevel } from '../types/common'
import Transport from '../utils/transport'

export class IOTransport extends Transport<{ method: 'process' | 'vanilla' }> {
  public handle(data: LoggerData) {
    if (this.options.method === 'vanilla') {
      if (data.level === LoggerLevel.FATAL || data.level === LoggerLevel.ERROR) {
        console.error(data)
      } else {
        console.log(data)
      }
      return
    }
    const content = `${stringify(data)}\n`
    if (data.level === LoggerLevel.FATAL || data.level === LoggerLevel.ERROR) {
      process.stderr.write(content)
    } else {
      process.stdout.write(content)
    }
  }
}

export default IOTransport
