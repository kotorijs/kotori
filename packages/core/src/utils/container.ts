import { none } from '@kotori-bot/tools';
import { Context } from '../context';

export class Container {
  protected constructor() {
    none();
  }

  private static instance: Context = {} as Context;

  protected static setInstance(ctx: Context) {
    this.instance = ctx;
  }

  static getInstance() {
    return this.instance;
  }

  static getMixin(): Context {
    return Object.assign(Container.getInstance() /* , Context */);
  }
}
export default Container;
