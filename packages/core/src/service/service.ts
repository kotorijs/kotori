import { none } from '@kotori-bot/tools';

type ModuleType = 'database' | 'adapter' | 'service' | 'plugin';
type ServiceType = Exclude<ModuleType, 'plugin' | 'service'> | 'custom';

interface ServiceImpl {
  readonly config: object;
  readonly serviceType: ServiceType;
  readonly service: string;
  handle(...data: unknown[]): void;
  start(): void;
  stop(): void;
}

export abstract class Service implements ServiceImpl {
  handle(...data: unknown[]): void {
    return none(this, data);
  }

  start(): void {
    return none(this);
  }

  stop(): void {
    return none(this);
  }

  readonly serviceType: ServiceType;

  readonly service: string;

  readonly config: object;

  constructor(serviceType: ServiceType, service: string, config: object = {}) {
    this.serviceType = serviceType;
    this.config = config;
    if (serviceType === 'adapter') {
      this.service = 'adapter';
      return;
    }
    if (serviceType === 'database') {
      this.service = 'database';
      return;
    }
    this.service = service;
  }
}

export default Service;
