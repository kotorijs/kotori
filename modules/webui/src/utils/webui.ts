import { Context, Service, Tsu, none } from 'kotori-bot';
import { generateToken, getCpuData, getRamData } from './common';
import { DEFAULT_PASSWORD, DEFAULT_USERNAME } from '../constant';

export const config = Tsu.Object({
  username: Tsu.String().default(DEFAULT_USERNAME),
  password: Tsu.String().default(DEFAULT_PASSWORD),
  interval: Tsu.Number().default(5)
});

export class Webui extends Service<Tsu.infer<typeof config>> {
  public constructor(ctx: Context, cfg: Tsu.infer<typeof config>) {
    super(ctx, cfg, 'webui');
  }

  public generateToken() {
    return this.ctx.file.load('token', 'txt');
  }

  public updateToken() {
    return this.ctx.file.save('token', generateToken(), 'txt');
  }

  public checkToken(token: string) {
    return token === `Bearer ${this.generateToken()}`;
  }

  public getStats() {
    none(this);
    return {
      ram: getRamData(),
      cpu: getCpuData(),
      chats: {
        received: 0,
        sent: 0
      }
    };
  }

  /*   public getMsgRecordTotal() {

  }

  public update */
}
