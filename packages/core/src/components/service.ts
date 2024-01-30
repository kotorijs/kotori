import { none } from '@kotori-bot/tools';
import { ServiceImpl, ServiceType } from '../types';

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
