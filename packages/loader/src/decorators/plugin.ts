import type { Context } from '@kotori-bot/core'

export abstract class KotoriPlugin<T extends object | undefined = undefined> {
  protected readonly ctx: Context

  protected readonly config: T

  constructor(ctx: Context, config: T) {
    this.ctx = ctx
    this.config = config
  }
}

export default KotoriPlugin
