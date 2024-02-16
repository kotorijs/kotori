import type { Context } from '@kotori-bot/core';
import { Logger } from '@kotori-bot/logger';

export class KotoriLogger extends Logger {
  constructor(
    private optionsSelf: Logger['options'],
    private ctx: Context
  ) {
    super(optionsSelf);
  }

  private setLabel() {
    const origin = Object.create(this.optionsSelf.label);
    const label = this.ctx.identity ? [this.ctx.identity, ...this.optionsSelf.label] : this.optionsSelf.label;
    (this[(() => 'options')() as keyof this] as Logger['options']).label = label;
    return () => {
      (this[(() => 'options')() as keyof this] as Logger['options']).label = origin;
    };
  }

  fatal(...args: unknown[]) {
    const dispose = this.setLabel();
    super.fatal(...args);
    dispose();
  }

  error(...args: unknown[]) {
    const dispose = this.setLabel();
    super.error(...args);
    dispose();
  }

  warn(...args: unknown[]) {
    const dispose = this.setLabel();
    super.warn(...args);
    dispose();
  }

  info(...args: unknown[]) {
    const dispose = this.setLabel();
    super.info(...args);
    dispose();
  }

  debug(...args: unknown[]) {
    const dispose = this.setLabel();
    super.debug(...args);
    dispose();
  }

  trace(...args: unknown[]) {
    const dispose = this.setLabel();
    super.trace(...args);
    dispose();
  }
}

export default KotoriLogger;
