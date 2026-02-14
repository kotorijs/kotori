import { join } from 'node:path'
import { type Context, createConfig, type JsonMap, loadConfig, Service, saveConfig } from '@kotori-bot/core'

export class File extends Service {
  constructor(ctx: Context) {
    super(ctx, {}, 'file')
  }

  public getDir() {
    return join(this.ctx.baseDir.data, ...(this.ctx.identity ? this.ctx.identity.toString().split('/') : []))
  }

  public getFile(filename: string) {
    return join(this.getDir(), filename)
  }

  public load<O = undefined, T extends Parameters<typeof loadConfig>[1] = 'json'>(
    filename: string,
    type?: T,
    init?: T extends 'text' ? string : object
  ) {
    return loadConfig(this.getFile(filename), type, init) as O extends undefined
      ? T extends 'text'
      ? string
      : JsonMap
      : O
  }

  public save(filename: string, data: Parameters<typeof saveConfig>[1], type?: Parameters<typeof saveConfig>[2]) {
    saveConfig(this.getFile(filename), data, type)
  }

  public create(
    filename: string,
    data?: Parameters<typeof createConfig>[1],
    type?: Parameters<typeof createConfig>[2]
  ) {
    createConfig(this.getFile(filename), data, type)
  }
}

export default File
