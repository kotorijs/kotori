/* eslint import/prefer-default-export: 0 */

import { LoggerFilter } from './internal';

export enum LoggerLevel {
  TRACE = 10,
  DEBUG = 20,
  INFO = 30,
  WARN = 40,
  ERROR = 50,
  FATAL = 60,
  SILENT = Infinity
}

export interface TransportOptionsBase {
  filter?: LoggerFilter;
}
