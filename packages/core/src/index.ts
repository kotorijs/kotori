import { none } from '@kotori-bot/tools';
import Context from './context';

export * from './components/adapter';
export * from './components/api';
export * from './components/elements';
export * from './context';
export * from './utils/errror';
export * from './consts';
export * from './types';
export * from '@kotori-bot/tools';
export * from 'tsukiko';

export class ContextInstance {
  protected constructor() {
    none();
  }

  private static instance: Context = {} as Context;

  protected static setInstance(ctx: Context) {
    this.instance = ctx;
  }

  public static getInstance() {
    return this.instance;
  }

  public static getMixin() {
    return Object.assign(ContextInstance.getInstance() /* , Context */);
  }
}
