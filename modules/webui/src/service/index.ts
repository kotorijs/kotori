import { Context, Service, Symbols, Transport, Tsu, none } from 'kotori-bot';
import { generateToken, generateVerifyHash, getCpuData, getDate, getRamData } from '../utils/common';
import { KEY, LoginStats, MsgRecordDay, MsgRecordTotal } from '../types';
import WebuiTransport from '../utils/transport';

export const config = Tsu.Object({
  interval: Tsu.Number().range(60 * 1, 60 * 60 * 12).default(60 * 5)
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

    /* Load records from file to cache and memory */
    const msgTotal = this.ctx.file.load<MsgRecordTotal['origin']>(`${KEY.MSG_TOTAL}.json`, 'json', {});
    const msgDay = this.ctx.file.load<MsgRecordDay['origin']>(`${KEY.MSG_DAY}${getDate()}.json`, 'json', {});
    this.setMsgTotal({ origin: msgTotal });
    this.setMsgDay({ day: getDate(), origin: msgDay });
    this.ctx[Symbols.bot].forEach((bot) =>
      bot.forEach((api) => {
        const { adapter } = api;
        const { identity } = adapter;
        if (!(identity in msgTotal)) return;
        adapter.status.sentMsg = msgTotal[identity].sent;
        adapter.status.receivedMsg = msgTotal[identity].received;
      })
    );

    /* Auto save records from cache to file */
    this.timer = setInterval(() => {
      this.ctx.file.save(`${KEY.MSG_TOTAL}.json`, this.getMsgTotal().origin, 'json');
      const msgDay = this.getMsgDay();
      const currentDay = getDate();
      if (msgDay.day === currentDay) {
        this.ctx.file.save(`${KEY.MSG_DAY}${msgDay.day}.json`, msgDay.origin, 'json');
      } else {
        this.setMsgDay({ day: currentDay, origin: {} });
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

  public stop() {
    if (this.timer) clearInterval(Number(this.timer));
  }

  public getVerifySalt() {
    return this.ctx.file.load('salt', 'text');
  }

  public setVerifyHash(username: string, password: string) {
    const salt = generateToken();
    this.ctx.file.save('salt', salt);
    this.ctx.file.save('hash', generateVerifyHash(username, password, salt));
  }

  public checkVerifyHash(username: string, password: string) {
    const salt = this.getVerifySalt();
    return !!salt && generateVerifyHash(username, password, salt) === this.ctx.file.load('hash', 'text');
  }

  public addToken() {
    const list = this.ctx.cache.get<string[]>(KEY.TOKENS) ?? [];
    const token = generateToken();
    list.push(token);
    this.ctx.cache.set(KEY.TOKENS, list);
    return token;
  }

  public removeToken(authorization?: string) {
    const list = this.ctx.cache.get<string[]>(KEY.TOKENS) ?? [];
    if (!list) return;
    const token = authorization?.replace('Bearer ', '');
    this.ctx.cache.set(KEY.TOKENS, token !== undefined ? list.filter((t) => t !== token) : []);
  }

  public checkToken(authorization?: string) {
    return (
      authorization && (this.ctx.cache.get<string[]>(KEY.TOKENS) ?? []).includes(authorization.replace('Bearer ', ''))
    );
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
    const dateString = getDate(days);
    return this.ctx.file.load(`${KEY.MSG_DAY}${dateString}.json`, 'json', {
      day: dateString,
      origin: {}
    });
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
