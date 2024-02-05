import { LocaleType } from '@kotori-bot/i18n';
import { EventDataTargetId } from '.';

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
export interface ModuleConfig {
  filter: object;
}
