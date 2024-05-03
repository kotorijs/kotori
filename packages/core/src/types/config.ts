import type { LocaleType } from '@kotori-bot/i18n';
import type { EventDataTargetId } from './message';
import { ModuleConfig } from 'fluoro';

export interface CoreConfig {
  global: GlobalConfig;
  adapter: {
    [propName: string]: AdapterConfig;
  };
  plugin: {
    [propName: string]: ModuleConfig;
  };
}

export interface GlobalConfig {
  lang: LocaleType;
  'command-prefix': string;
}

export interface AdapterConfig {
  extends: string;
  master: EventDataTargetId;
  lang: LocaleType;
  'command-prefix': string;
}
