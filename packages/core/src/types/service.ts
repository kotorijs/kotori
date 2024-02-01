import type { EventDataTargetId } from './events';
import type { Context } from '../context/index';
import type { Api, Adapter } from '../components';
import type { AdapterConfig } from './config';
import { Service } from '../components';

export type ModuleType = 'database' | 'adapter' | 'service' | 'plugin';
export type ServiceType = Exclude<ModuleType, 'plugin' | 'service'> | 'custom';

export interface ServiceImpl {
  readonly config: object;
  readonly serviceType: ServiceType;
  readonly service: string;
  handle(...data: unknown[]): void;
  start(): void;
  stop(): void;
}

export interface AdapterImpl<T extends Api> extends ServiceImpl {
  readonly ctx: Context;
  readonly platform: string;
  readonly selfId: EventDataTargetId;
  readonly identity: string;
  readonly api: T;
  readonly status: AdapterStatus;
}

export interface AdapterStatus {
  value: 'online' | 'offline';
  createTime: Date;
  lastMsgTime: Date | null;
  receivedMsg: number;
  sentMsg: number;
  offlineTimes: number;
}

export type ServiceClass = new (config: object) => Service;
export type AdapterClass = new (ctx: Context, config: AdapterConfig, identity: string) => Adapter;
// export type DatabaseClass = new (config: /* DatabaseConfig , identity: string */ /*  object) => Database;
