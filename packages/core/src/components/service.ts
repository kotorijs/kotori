import { none } from '@kotori-bot/tools';
import { ServiceImpl, ServiceType } from '../types';

export abstract class Service implements ServiceImpl {
  public handle(...data: unknown[]): void {
    return none(this, data);
  }

  public start(): void {
    return none(this);
  }

  public stop(): void {
    return none(this);
  }

  public readonly serviceType: ServiceType;

  public readonly service: string;

  public readonly config: object;

  public constructor(serviceType: ServiceType, service: string, config: object = {}) {
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
