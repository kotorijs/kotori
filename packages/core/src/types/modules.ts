import { LocaleType } from '@kotori-bot/i18n';
import type { EventDataBase } from './core';

declare module './core' {
  interface EventsList {
    ready: EventDataReady;
    error: EventDataError;
    dispose: EventDataDispose;
  }
}

interface EventDataReady extends EventDataBase<'ready'> {
  module?: ModuleInstance | string;
  state?: boolean;
}

interface EventDataError extends EventDataBase<'error'> {
  error: unknown;
}

interface EventDataDispose extends EventDataBase<'dispose'> {
  module?: ModuleInstance | string;
}

export interface ModulePackage {
  name: string;
  version: string;
  description: string;
  main: string;
  license: 'GPL-3.0';
  author: string | string[];
  peerDependencies: {
    'kotori-bot': string;
    [propName: string]: string;
  };
  kotori: {
    enforce?: 'pre' | 'post';
    meta: {
      language: LocaleType[];
    };
  };
}

export interface ModuleInstance {
  pkg: ModulePackage;
  files: string[];
  main: string;
}
