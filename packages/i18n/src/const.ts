import { LocaleType } from './common';
import LocaleIdentifier from './types/locale';

export const DEFAULT_SUPPORTS = Object.keys(LocaleIdentifier) as LocaleType[];
export const DEFAULT_LANG: LocaleType = 'en_US';
export const DEFAULT_EXT = '.json';
