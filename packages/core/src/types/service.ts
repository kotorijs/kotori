import type { Context } from '../context';
import type { Adapter, Service } from '../service';
import type { AdapterConfig } from './config';

declare module './core' {
  interface EventsMapping {
    connect(data: EventDataConnect): void;
    status(data: EventDataStatus): void;
  }
}

interface EventDataConnect {
  adapter: Adapter;
  type: 'connect' | 'disconnect';
  normal: boolean;
  mode: 'ws' | 'ws-reverse' | 'other';
  address: string;
}

interface EventDataStatus {
  adapter: Adapter;
  status: Adapter['status']['value'];
}

export type ServiceClass = new (config: object) => Service;
export type AdapterClass = new (ctx: Context, config: AdapterConfig, identity: string) => Adapter;
