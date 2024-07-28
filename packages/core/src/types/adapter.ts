import type { Context } from 'fluoro'
import type { Adapter } from '../components'
import type { AdapterConfig } from './config'

declare module 'fluoro' {
  interface EventsMapping {
    connect(data: EventDataConnect): void
    status(data: EventDataStatus): void
  }
}

interface EventDataConnect {
  adapter: Adapter
  type: 'connect' | 'disconnect'
  normal: boolean
  mode: 'ws' | 'ws-reverse' | 'other'
  address: string
}

interface EventDataStatus {
  adapter: Adapter
  status: Adapter['status']['value']
}

export type AdapterClass = new (ctx: Context, config: AdapterConfig, identity: string) => Adapter
