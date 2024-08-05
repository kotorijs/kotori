import { type Context, Service } from '@kotori-bot/core'
import { Level } from 'level'
import { resolve } from 'node:path'

class DatabaseReality extends Service<{ prefix: string }> {
  private readonly db: Level

  public constructor(ctx: Context, config: { prefix: string }) {
    super(ctx, config, 'database')
    this.db = new Level(resolve(this.ctx.baseDir.data, 'db'), { prefix: this.config.prefix })
  }

  public start() {
    this.db.open().then(() => this.ctx.logger.record(`Database opened with prefix: ${this.config.prefix}`))
  }

  public stop() {
    this.db.close()
  }
}

export type Database = Level & DatabaseReality

export const Database = new Proxy(DatabaseReality, {
  construct: (target, argArray, newTarget) =>
    new Proxy(Reflect.construct(target, argArray, newTarget), {
      get: (target, prop, receiver) => {
        if (prop in target) return Reflect.get(target, prop, receiver)
        const db = Reflect.get(target, 'db', receiver)
        if (!(prop in db)) return undefined
        const value = Reflect.get(db, prop, receiver)
        return typeof value === 'function' ? value.bind(db) : value
      }
    })
}) as typeof DatabaseReality

export default Database
