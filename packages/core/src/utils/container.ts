import { KotoriError } from './error'
import { Symbols } from '../global'
import type { Context } from '../app'

export class Container {
  private constructor() {}

  public static instance: Context

  public static [Symbols.setInstance](ctx: Context) {
    if (Container.instance) throw new KotoriError('Default context instance is already set')
    Container.instance = ctx
  }

  public static [Symbols.getInstance]() {
    if (!Container.instance) throw new KotoriError('Default context instance is not set')
    return Container.instance
  }
}

export default Container
