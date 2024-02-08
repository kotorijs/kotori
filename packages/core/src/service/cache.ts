import Service from './service';

type CacheKey = string | symbol;
type CacheValue = string | number | object;

export class Cache extends Service {
  private cache?: Map<CacheKey, CacheValue>;

  constructor(ctx: ConstructorParameters<typeof Service>[0]) {
    super(ctx, {}, 'cache');
  }

  start() {
    if (this.cache) return;
    this.cache = new Map();
  }

  stop() {
    this.cache?.clear();
    delete this.cache;
  }

  get<T = CacheValue>(prop: CacheKey) {
    return this.cache!.get(prop) as T;
  }

  set(prop: CacheKey, value: CacheValue) {
    this.cache!.set(prop, value);
  }
}

export default Cache;
