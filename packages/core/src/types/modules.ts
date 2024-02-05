import { LocaleType } from '@kotori-bot/i18n';

declare module './core' {
  interface EventsMapping {
    ready_module(data: EventDataReadyModule): void;
    dispose_module(data: EventDataDisposeModule): void;
  }
}

interface EventDataReadyModule {
  module: ModuleInstance | string;
  state: boolean;
}

interface EventDataDisposeModule {
  module: ModuleInstance | string;
}

export interface ModulePackage {
  name: string;
  version: string;
  description: string;
  main: string;
  keywords: string[];
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
