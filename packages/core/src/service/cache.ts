import { none, obj } from '@kotori-bot/tools';
import Service from './service';

export class Cache extends Service {
  private cacheStack?: obj;

  constructor() {
    super('custom', 'cache');
  }

  handle(data: unknown[]): void {
    none(this);
  }

  start(): void {
    this.cacheStack = {};
  }

  stop(): void {
    Object.keys(this.cacheStack!).forEach((key) => {
      delete this.cacheStack![key];
    });
    delete this.cacheStack;
  }
}

export default Cache;
