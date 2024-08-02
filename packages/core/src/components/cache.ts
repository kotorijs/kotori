import { Service } from 'fluoro'
import { KotoriError } from '../utils/error'

type CacheKey = string | symbol
type CacheValue = string | number | object

type Container = Map<CacheKey, CacheValue>

type CacheMap = Map<string, Container>

/**
 * Cache service
 *
 * @class
 * @extends Service
 */
export class Cache extends Service {
  private cache?: CacheMap = new Map()

  public constructor(ctx: ConstructorParameters<typeof Service>[0]) {
    super(ctx, {}, 'cache')
  }

  public start() {
    if (this.cache) return
    this.cache = new Map()
  }

  public stop() {
    if (this.cache) {
      for (const el of this.cache.values()) el.clear()
      this.cache.clear()
    }
    // biome-ignore lint:
    delete this.cache
  }

  /**
   * Get the container of current content instance.
   *
   * @returns THe container
   */
  public getContainer() {
    if (!this.cache) throw new KotoriError('Cache service is not started.', 'cache')
    const key = this.ctx.identity ?? 'root'
    if (!this.cache.has(key)) this.cache.set(key, new Map())
    return this.cache.get(key) as Container
  }

  /**
   * Get the value from current the container.
   *
   * @param prop The property name
   * @returns The value
   */
  public get<T = CacheValue>(prop: CacheKey) {
    return this.getContainer().get(prop) as T
  }

  /**
   * Set the value to current the container.
   *
   * @param prop The property name
   * @param value The value
   */
  public set(prop: CacheKey, value: CacheValue) {
    this.getContainer().set(prop, value)
  }
}

export default Cache
