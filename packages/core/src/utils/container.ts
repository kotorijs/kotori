import { none } from '@kotori-bot/tools';
import { Context } from 'fluoro';

export class Container {
  protected constructor() {
    none();
  }

  private static instance: Context = {} as Context;

  public static setInstance(ctx: Context) {
    this.instance = ctx;
  }

  public static getInstance() {
    return this.instance;
  }

  public static getMixin(): Context {
    return Object.assign(Container.getInstance() /* , Context */);
  }
}

export default Container;
