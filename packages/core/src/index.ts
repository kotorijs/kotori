import { none } from '@kotori-bot/tools';
import Context from './context';

export * from './components/service';
export * from './components/database';
export * from './components/adapter';
export * from './components/service';
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

  static getInstance() {
    return this.instance;
  }

  static getMixin() {
    return Object.assign(ContextInstance.getInstance() /* , Context */);
  }
}
