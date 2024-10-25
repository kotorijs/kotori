import { type Context, Service } from '@kotori-bot/core'
import { Level } from 'level'
import { resolve } from 'node:path'

type DbValue = string | number | object

class Database extends Service<{ prefix: string }> {
  public readonly level: Level

  private prefixKey(key: string): string {
    return `${this.ctx.identity?.toString() ?? ''}:${key}`
  }

  public constructor(ctx: Context, config: { prefix: string }) {
    super(ctx, config, 'database')
    this.level = new Level(resolve(this.ctx.baseDir.data, 'db'), { prefix: this.config.prefix })
  }

  public start() {
    this.level.open().then(() => this.ctx.logger.record(`Database opened with prefix: ${this.config.prefix}`))
  }

  public stop() {
    this.level.close()
  }
  public async get<T extends DbValue | null = DbValue | null>(key: string, init?: Exclude<T, null>): Promise<T> {
    try {
      const value = await this.level.get(this.prefixKey(key))
      return JSON.parse(value)
    } catch (error) {
      if (error && typeof error === 'object' && 'notFound' in error) {
        if (init === undefined) return null as T
        await this.put(key, init)
        return init
      }
      throw error
    }
  }

  public async getMany<T extends DbValue = DbValue>(keys: string[]): Promise<T[]> {
    const values = await this.level.getMany(keys.map(this.prefixKey.bind(this)))
    return values.map((value) => JSON.parse(value))
  }

  public async put<T extends DbValue>(key: string, value: T): Promise<void> {
    await this.level.put(this.prefixKey(key), JSON.stringify(value))
  }

  public async del(key: string): Promise<void> {
    await this.level.del(this.prefixKey(key))
  }

  public async batch<T extends DbValue>(
    operations: Array<{ type: 'put'; key: string; value: T } | { type: 'del'; key: string }>
  ): Promise<void> {
    const prefixedOps = operations.map((op) => ({
      ...op,
      key: this.prefixKey(op.key),
      value: 'value' in op ? JSON.stringify(op.value) : ''
    })) as Array<Omit<(typeof operations)[0], 'value'> & { value: string }>
    return this.level.batch(prefixedOps)
  }
}

export default Database
