import { Context, JsonMap, Service, createConfig, loadConfig, saveConfig } from '@kotori-bot/core';
import { join } from 'node:path';

export class File extends Service {
  constructor(ctx: Context) {
    super(ctx, {}, 'file');
  }

  public getDir() {
    return join(this.ctx.baseDir.data, ...(this.ctx.identity ? this.ctx.identity.split('/') : []));
  }

  public getFile(filename: string) {
    return join(this.getDir(), filename);
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  public load<O = undefined, T extends Parameters<typeof loadConfig>[1] = 'json'>(
    filename: string,
    type?: T,
    init?: T extends 'text' ? string : JsonMap
  ) {
    return loadConfig(this.getFile(filename), type, init) as O extends undefined
      ? T extends 'text'
        ? string
        : JsonMap
      : O;
  }
  /* eslint-enable @typescript-eslint/no-explicit-any */

  public save(filename: string, data: Parameters<typeof saveConfig>[1], type?: Parameters<typeof saveConfig>[2]) {
    saveConfig(this.getFile(filename), data, type);
  }

  public create(
    filename: string,
    data?: Parameters<typeof createConfig>[1],
    type?: Parameters<typeof createConfig>[2]
  ) {
    createConfig(this.getFile(filename), data, type);
  }
}

export default File;
