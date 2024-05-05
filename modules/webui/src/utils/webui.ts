import { addDays, format } from 'date-fns';
import { Context, Service, Transport, Tsu, none } from 'kotori-bot';
import { generateToken, getCpuData, getDate, getRamData } from './common';
import { DEFAULT_PASSWORD, DEFAULT_USERNAME } from '../constant';
import { KEY, LoginStats, MsgRecordDay, MsgRecordTotal } from '../types';
import WebuiTransport from './transport';

export const config = Tsu.Object({
  username: Tsu.String().default(DEFAULT_USERNAME),
  password: Tsu.String().default(DEFAULT_PASSWORD),
  interval: Tsu.Number().default(5)
});

export class Webui extends Service<Tsu.infer<typeof config>> {
  private timer?: NodeJS.Timer;

  public constructor(ctx: Context, cfg: Tsu.infer<typeof config>) {
    super(ctx, cfg, 'webui');
  }

  public start() {
    /* Add webui transport to logger */
    const logger = this.ctx.get('logger') as { options: { transports: Transport[] } };
    logger.options.transports.push(new WebuiTransport({}));

    /* Load records from file to cache */
    const msgTotal = this.ctx.file.load<MsgRecordTotal['origin']>(`${KEY.MSG_TOTAL}.json`, 'json', {});
    const msgDay = this.ctx.file.load<MsgRecordDay['origin']>(`${KEY.MSG_DAY}${getDate()}.json`, 'json', {});
    this.setMsgTotal({ origin: msgTotal });
    this.setMsgDay({ day: getDate(), origin: msgDay });

    /* Auto save records from cache to file */
    this.timer = setInterval(() => {
      this.ctx.file.save(`${KEY.MSG_TOTAL}.json`, this.getMsgTotal().origin, 'json');
      const msgDay = this.getMsgDay();
      if (msgDay.day === getDate()) {
        this.ctx.file.save(`${KEY.MSG_DAY}${getDate()}.json`, msgDay.origin, 'json');
      } else {
        this.setMsgDay({ day: getDate(), origin: {} });
      }
    }, this.config.interval * 1000);

    /* Update records */
    this.ctx.on('send', (data) => {
      const { identity } = data.api.adapter;
      const { origin: dataTotal } = this.getMsgTotal();
      const { origin: dataDay } = this.getMsgDay();
      if (!(identity in dataTotal)) dataTotal[identity] = { sent: 0, received: 0 };
      if (!(identity in dataDay)) dataDay[identity] = { sent: 0, received: 0 };
      dataTotal[identity].sent = (dataTotal[identity].sent || 0) + 1;
      dataDay[identity].sent = (dataDay[identity].sent || 0) + 1;
    });
    this.ctx.midware((next, session) => {
      next();
      const { identity } = session.api.adapter;
      const { origin: dataTotal } = this.getMsgTotal();
      const { origin: dataDay } = this.getMsgDay();
      if (!(identity in dataTotal)) dataTotal[identity] = { sent: 0, received: 0 };
      if (!(identity in dataDay)) dataDay[identity] = { sent: 0, received: 0 };
      dataTotal[identity].received = (dataTotal[identity].received || 0) + 1;
      dataDay[identity].received = (dataDay[identity].received || 0) + 1;
    }, 10);
  }

  public generateToken() {
    return this.ctx.file.load('token', 'txt');
  }

  public updateToken() {
    return this.ctx.file.save('token', generateToken(), 'txt');
  }

  public checkToken(token?: string) {
    return token && token === `Bearer ${this.generateToken()}`;
  }

  public getStats() {
    none(this);
    return {
      ram: getRamData(),
      cpu: getCpuData()
    };
  }

  public getMsgTotal() {
    return this.ctx.cache.get<MsgRecordTotal>(KEY.MSG_TOTAL);
  }

  public setMsgTotal(data: MsgRecordTotal) {
    this.ctx.cache.set(KEY.MSG_TOTAL, data);
  }

  public getMsgDay(days: number = 0): MsgRecordDay {
    if (!days) return this.ctx.cache.get<MsgRecordDay>(KEY.MSG_DAY);
    const dateString = format(addDays(new Date(), -days), 'yyyy-M-d');
    return {
      day: dateString,
      origin: this.ctx.file.load<MsgRecordDay['origin']>(`${KEY.MSG_DAY}${dateString}.json`, 'json', {
        sent: 0,
        received: 0
      })
    };
  }

  public setMsgDay(data: MsgRecordDay) {
    this.ctx.cache.set(KEY.MSG_DAY, data);
  }

  public getLoginStats() {
    return this.ctx.file.load<LoginStats>(`${KEY.LOGIN_STATS}.json`, 'json', { success: 0, failed: 0 });
  }

  public setLoginStats(stats: LoginStats) {
    this.ctx.file.save(`${KEY.LOGIN_STATS}.json`, stats, 'json');
  }
}
