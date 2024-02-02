import type { Context } from '../context';
import type { Api, Adapter, Service } from '../service';
import type { AdapterConfig } from './config';
import type { EventDataBase, EventsList } from './core';

declare module './core' {
  interface EventsList {
    connect: EventDataConnect;
    disconnect: EventDataDisconnect;
    online: EventDataOnline;
    offline: EventDataOffline;
  }
}

interface EventDataServiceBase<T extends keyof EventsList> extends EventDataBase<T> {
  service: Service; // fix question
}

interface EventDataConnect extends EventDataServiceBase<'connect'> {
  normal: boolean;
  info: string;
  onlyStart?: boolean;
}

interface EventDataDisconnect extends EventDataServiceBase<'disconnect'> {
  normal: boolean;
  info: string;
}

interface EventDataOnline extends EventDataBase<'online'> {
  adapter: Api['adapter'];
}

interface EventDataOffline extends EventDataBase<'offline'> {
  adapter: Api['adapter'];
}

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
