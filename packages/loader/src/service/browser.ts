import type { Service } from '@kotori-bot/core'

export interface Browser extends Service {
  // biome-ignore lint:
  page: () => Promise<any>
}

export default Browser
