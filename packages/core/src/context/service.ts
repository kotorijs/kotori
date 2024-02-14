import { none } from '@kotori-bot/tools';
import { Context } from './context';

interface ServiceImpl<T extends object = object> {
  readonly identity: string;
  readonly config: T;
  start(): void;
  stop(): void;
}

export abstract class Service<T extends object = object> implements ServiceImpl<T> {
  readonly ctx: Context;

  readonly config: T;

  readonly identity: string;

  constructor(ctx: Context, config: T, identity: string) {
    this.ctx = ctx;
    this.config = config;
    this.identity = identity;
  }

  start(): void {
    return none(this);
  }

  stop(): void {
    return none(this);
  }
}

export default Service;
