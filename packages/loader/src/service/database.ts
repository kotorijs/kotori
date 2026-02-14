import { resolve } from 'node:path'
import { type Context, Service } from '@kotori-bot/core'
import { Level } from 'level'

// import { spawn } from 'node:child_process'
// import { createReadStream, createWriteStream, existsSync, rmSync } from 'node:fs'
// import { createGunzip } from 'node:zlib'

type DatabaseValue = string | number | object

interface DatabaseConfig {
  prefix: string
  duration: number
}

class Database extends Service<DatabaseConfig> {
  // private readonly filename = resolve(this.ctx.baseDir.root, 'datab.db')

  private readonly usingDir = resolve(this.ctx.baseDir.data, 'db')

  // private updated = false

  // private timer?: NodeJS.Timer

  public readonly level: Level

  // private async zip() {
  //   const output = createWriteStream(this.filename)
  //   const gzip = createGunzip()
  //   const tar = spawn('tar', ['-czf', '-', this.usingDir])

  //   return new Promise<void>((resolve, reject) => {
  //     const timer = setTimeout(() => {
  //       reject('Timeout during zip process')
  //     }, this.config.duration)

  //     tar.stdout.pipe(gzip).pipe(output)
  //     tar.on('close', (code) => {
  //       if (code) {
  //         reject(`Tar process exited with code ${code}`)
  //       } else {
  //         clearTimeout(timer)
  //         resolve()
  //       }
  //     })

  //     tar.on('error', (err) => {
  //       reject(err)
  //     })
  //   })
  // }

  // private async unzip() {
  //   if (!existsSync(this.filename)) {
  //     rmSync(this.usingDir, { recursive: true })
  //     return
  //   }

  //   const input = createReadStream(this.filename)
  //   const gunzip = createGunzip()
  //   const tar = spawn('tar', ['-xzf', '-', '-C', this.usingDir])

  //   return new Promise<void>((resolve, reject) => {
  //     const timer = setTimeout(() => {
  //       reject('Timeout during unzip process')
  //     }, this.config.duration * 10)

  //     input.pipe(gunzip).pipe(tar.stdin)

  //     tar.on('close', (code) => {
  //       if (code) {
  //         console.error(`Tar process exited with code ${code}`)
  //       } else {
  //         clearTimeout(timer)
  //         resolve()
  //       }
  //     })

  //     tar.on('error', (err) => {
  //       console.error(err)
  //     })
  //   })
  // }

  private prefixKey(key: string): string {
    return `${this.ctx.identity?.toString() ?? ''}:${key}`
  }

  public constructor(ctx: Context, config: DatabaseConfig) {
    super(ctx, config, 'database')
    this.level = new Level(resolve(this.usingDir), { prefix: config.prefix })
  }

  public async start() {
    // await this.unzip().catch((err) => this.ctx.logger.error('Error during database unzip:', err))
    this.level.open().then(() => this.ctx.logger.record(`Database opened with prefix: ${this.config.prefix}`))
    // this.timer = setInterval(() => {
    //   if (!this.updated) {
    //     this.ctx.logger.trace('Database updated, zipping and uploading')
    //     this.zip()
    //       .then(() => {
    //         this.updated = true
    //       })
    //       .catch((err) => this.ctx.logger.error('Error during database zipping:', err))
    //   }
    // }, this.config.duration)
  }

  public stop() {
    this.level.close()
    // if (this.timer) clearInterval(Number(this.timer))
  }

  public async get<T extends DatabaseValue | null = DatabaseValue | null>(
    key: string,
    init?: Exclude<T, null>
  ): Promise<T> {
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

  public async getMany<T extends DatabaseValue = DatabaseValue>(keys: string[]): Promise<T[]> {
    const values = await this.level.getMany(keys.map(this.prefixKey.bind(this)))
    return values.map((value) => JSON.parse(value))
  }

  public async put<T extends DatabaseValue>(key: string, value: T): Promise<void> {
    await this.level.put(this.prefixKey(key), JSON.stringify(value))
    // this.updated = false
  }

  public async del(key: string): Promise<void> {
    await this.level.del(this.prefixKey(key))
    // this.updated = false
  }

  public async batch<T extends DatabaseValue>(
    operations: Array<{ type: 'put'; key: string; value: T } | { type: 'del'; key: string }>
  ): Promise<void> {
    const prefixedOps = operations.map((op) => ({
      ...op,
      key: this.prefixKey(op.key),
      value: 'value' in op ? JSON.stringify(op.value) : ''
    })) as Array<Omit<(typeof operations)[0], 'value'> & { value: string }>
    await this.level.batch(prefixedOps)
    // this.updated = false
  }
}

export default Database
