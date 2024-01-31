import type { ModuleInstance } from './modules';

export interface EventDataBase<T extends keyof EventsList> {
  type: T;
}

interface EventDataReady extends EventDataBase<'ready'> {
  module?: ModuleInstance | string;
}

interface EventDataError extends EventDataBase<'error'> {
  error: Error;
}

interface EventDataDispose extends EventDataBase<'dispose'> {
  module?: ModuleInstance | string;
}

export interface EventsList {
  ready: EventDataReady;
  error: EventDataError;
  dispose: EventDataDispose;
}
