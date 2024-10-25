import type { Context } from '@kotori-bot/core'
import { Logger } from '@kotori-bot/logger'

export class KotoriLogger extends Logger {
  public constructor(
    private optionsSelf: Logger['options'],
    private ctx: Context
  ) {
    super(optionsSelf)
  }

  private setLabel() {
    const origin = Object.create(this.optionsSelf.label)
    const label = this.ctx.identity ? [this.ctx.identity, ...this.optionsSelf.label] : this.optionsSelf.label
    ;(this[(() => 'options')() as keyof this] as Logger['options']).label = label as string[]
    return () => {
      ;(this[(() => 'options')() as keyof this] as Logger['options']).label = origin
    }
  }

  public fatal(...args: unknown[]) {
    const dispose = this.setLabel()
    super.fatal(...args)
    dispose()
  }

  public error(...args: unknown[]) {
    const dispose = this.setLabel()
    super.error(...args)
    dispose()
  }

  public warn(...args: unknown[]) {
    const dispose = this.setLabel()
    super.warn(...args)
    dispose()
  }

  public info(...args: unknown[]) {
    const dispose = this.setLabel()
    super.info(...args)
    dispose()
  }

  public record(...args: unknown[]) {
    const dispose = this.setLabel()
    super.record(...args)
    dispose()
  }

  public debug(...args: unknown[]) {
    const dispose = this.setLabel()
    super.debug(...args)
    dispose()
  }

  public trace(...args: unknown[]) {
    const dispose = this.setLabel()
    super.trace(...args)
    dispose()
  }
}

export default KotoriLogger
