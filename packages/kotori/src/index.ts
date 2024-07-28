import { Container, type Context } from '@kotori-bot/core'

export * from '@kotori-bot/core'
export * from '@kotori-bot/loader'

export const Kotori = new Proxy(
  {},
  {
    get: (_, prop) => {
      const target = Container.getInstance()
      if (prop === undefined) return target
      return target[prop as keyof Context]
    }
  }
) as Context

export default Kotori
