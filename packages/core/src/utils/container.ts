import type { Context } from 'fluoro'
import { KotoriError } from './error'

export namespace Container {
  let instance: Context

  export function setInstance(ctx: Context) {
    if (instance) throw new KotoriError('Default context instance is already set')
    instance = ctx
  }

  export function getInstance() {
    if (!instance) throw new KotoriError('Default context instance is not set')
    return instance
  }
}

export default Container
