import { Container } from '@kotori-bot/core'
import { resolve } from 'node:path'

export * from '@kotori-bot/core'
export * from '@kotori-bot/loader'

export const Kotori = new Proxy(Container.getMixin(), {
  get: (_, prop) => {
    const target = Container.getMixin()
    if (!target.root.meta.version) target.root.meta.version = require(resolve(__dirname, '../package.json')).version
    if (prop === undefined) return target
    return target[prop as keyof typeof target]
  }
})

export default Kotori
