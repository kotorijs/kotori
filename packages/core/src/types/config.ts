import Tsu from 'tsukiko';
import { DEFAULT_SUPPORTS, LocaleType } from '@kotori-bot/i18n';
import type { Core } from '../components';

export type CoreConfig = Exclude<ConstructorParameters<typeof Core>[0], undefined>;
export type KotoriConfig = CoreConfig['config'];
export type AdapterConfig = KotoriConfig['adapter'][0];
export type ModuleConfig = KotoriConfig['plugin'][0];

export const localeTypeSchema = Tsu.Custom<LocaleType>(
  (val) => typeof val === 'string' && DEFAULT_SUPPORTS.includes(val as LocaleType)
);
