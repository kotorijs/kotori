import { Symbols, type Context } from '@kotori-bot/core'
import { Container } from './utils/container'

export * from './utils/container'
export * from '@kotori-bot/core'
export * from '@kotori-bot/loader'

export const Kotori = new Proxy(
  {},
  {
    get: (_, prop) => Container[Symbols.getInstance]()[prop as keyof Context]
  }
) as Context

export default Kotori
