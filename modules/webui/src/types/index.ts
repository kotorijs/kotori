import { LoggerData } from 'kotori-bot';
import type { Webui } from '../utils/webui';

declare module 'kotori-bot' {
  interface Context {
    webui: Webui;
  }

  interface EventsMapping {
    console_output(data: LoggerData | { msg: string }): void;
  }
}

export { Context } from 'kotori-bot';

export const enum KEY {
  MSG_TOTAL = 'msg-total',
  MSG_DAY = 'msg-day',
  LOGIN_STATS = 'login-stats'
}

export interface MsgRecord {
  received: number;
  sent: number;
}

export interface MsgRecordDay {
  day: string;
  origin: Record<string, MsgRecord>;
}

export interface MsgRecordTotal {
  origin: Record<string, MsgRecord>;
}

export interface LoginStats {
  success: number;
  failed: number;
}
