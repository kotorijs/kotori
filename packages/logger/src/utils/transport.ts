import { LoggerData, TransportOptionsBase } from '../types/common';
import type { LoggerFilter } from '../types/internal';
import type { escaper } from './escaper';

interface TransportImpl<C extends object> {
  readonly options: C & TransportOptionsBase;
  escaper?: typeof escaper;
  handle(data: LoggerData): void;
}

export abstract class Transport<C extends object = object> implements TransportImpl<C> {
  constructor(options: C & { filter?: LoggerFilter }) {
    this.options = options;
  }

  readonly options: C & { filter?: LoggerFilter };

  escaper?: typeof escaper;

  abstract handle(data: LoggerData): void;
}

export default Transport;
