import env from 'dotenv'
import { BUILD_MODE, DEV_MODE } from '@kotori-bot/loader'

if (!process.env.IS_DAEMON) env.config()

export default {
  mode: process.env.NODE_ENV === DEV_MODE ? DEV_MODE : BUILD_MODE,
  dir: process.env.DIR,
  config: process.env.CONFIG,
  port: process.env.PORT ? Number(process.env.PORT) : undefined,
  level: process.env.LEVEL ? Number(process.env.LEVEL) : undefined,
  noColor: process.env.NO_COLOR === 'on',
  isDaemon: !!process.env.IS_DAEMON
}
