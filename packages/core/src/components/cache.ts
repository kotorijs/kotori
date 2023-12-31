import { obj } from '@kotori-bot/tools';
import Service from './service';

export class Cache extends Service {
  private cacheStack?: obj;

  public constructor() {
    super('custom', 'cache');
  }

  public handle(data: unknown[]): void {
    // this.
  }

  public start(): void {
    this.cacheStack = {};
  }

  public stop(): void {
    Object.keys(this.cacheStack!).forEach(key => {
      delete this.cacheStack![key];
    });
    delete this.cacheStack;
  }
}

export default Cache;
