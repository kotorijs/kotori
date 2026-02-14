import { Container, type Context, Symbols } from '@kotori-bot/core'

export * from '@kotori-bot/core'
export * from '@kotori-bot/loader'

export const Kotori = new Proxy(
  {},
  {
    get: (_, prop) => Container[Symbols.getInstance]()[prop as keyof Context]
  }
) as Context

export default Kotori
