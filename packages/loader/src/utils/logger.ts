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
    const label = this.ctx.identity ? [this.ctx.identity, ...this.optionsSelf.label] : [];
    (this[(() => 'options')() as keyof this] as { label: string[] }).label = label;
  }

  fatal(...args: unknown[]) {
    this.setLabel();
    super.fatal(...args);
  }

  error(...args: unknown[]) {
    this.setLabel();
    super.error(...args);
  }

  warn(...args: unknown[]) {
    this.setLabel();
    super.warn(...args);
  }

  info(...args: unknown[]) {
    this.setLabel();
    super.info(...args);
  }

  debug(...args: unknown[]) {
    this.setLabel();
    super.debug(...args);
  }

  trace(...args: unknown[]) {
    this.setLabel();
    super.trace(...args);
  }
}

export default KotoriLogger;
