import type { Webui } from '../utils/webui';

declare module 'kotori-bot' {
  interface Context {
    webui: Webui;
  }
}

export { Context } from 'kotori-bot';

export const enum KEY {
  MSG_SENT = 'msg_sent',
  MSG_RECEIVED = 'msg_received'
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
