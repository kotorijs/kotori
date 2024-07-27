import IOTransport from './transport/io'
import { LoggerLevel } from './types/common'

export const DEFAULT_LOGGER_OPTIONS = {
  level: LoggerLevel.INFO,
  label: [],
  transports: new IOTransport({ method: 'process' })
}
