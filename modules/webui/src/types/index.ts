import type { Adapter, Command, LoggerData } from 'kotori-bot'
import type { Webui } from '../service'

declare module 'kotori-bot' {
  interface Context {
    webui: Webui
  }

  interface EventsMapping {
    console_output(data: LoggerData | { msg: string }): void
  }
}

export type BotStats = Record<
  string,
  Omit<Adapter['status'], 'value' | 'createTime' | 'lastMsgTime'> & { createTime: number; lastMsgTime: number | null }
>

export type BotStatsDay = Record<string, Pick<Adapter['status'], 'sentMsg' | 'receivedMsg' | 'offlineTimes'>>

export type CommandSettings = Record<string, Omit<Command['meta'], 'root' | 'args' | 'options'>>

export interface LoginStats {
  success: number
  failed: number
}

export interface AccountData {
  salt: string
  hash: string
}
