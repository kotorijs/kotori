import { Service } from '../context';

type CacheKey = string | symbol;
type CacheValue = string | number | object;

export class Cache extends Service {
  private cache?: Map<string, Map<CacheKey, CacheValue>>;

  constructor(ctx: ConstructorParameters<typeof Service>[0]) {
    super(ctx, {}, 'cache');
  }

  start() {
    if (this.cache) return;
    this.cache = new Map();
  }

  stop() {
    this.cache?.forEach((el) => el.clear());
    this.cache?.clear();
    delete this.cache;
  }

  getContainer() {
    const key = this.ctx.identity ?? 'root';
    if (!this.cache!.has(key)) this.cache!.set(key, new Map());
    return this.cache!.get(key)!;
  }

  get<T = CacheValue>(prop: CacheKey) {
    return this.getContainer().get(prop) as T;
  }

  set(prop: CacheKey, value: CacheValue) {
    this.getContainer().set(prop, value);
  }
}

export default Cache;
