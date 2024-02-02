import Tsu from 'tsukiko';
import { DEFAULT_SUPPORTS, LocaleType } from '@kotori-bot/i18n';

export const localeTypeSchema = Tsu.Custom<LocaleType>(
  (val) => typeof val === 'string' && DEFAULT_SUPPORTS.includes(val as LocaleType)
);

export const eventDataTargetIdSchema = Tsu.Union([Tsu.String(), Tsu.Number()]);
export type EventDataTargetId = Tsu.infer<typeof eventDataTargetIdSchema>;
