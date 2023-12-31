import { ServiceImpl, ServiceType } from '../types';

export abstract class Service implements ServiceImpl {
  public abstract handle(...data: unknown[]): void;

  public abstract start(): void;

  public abstract stop(): void;

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
