import { Transport } from '../utils/transport';
import { LoggerData, LoggerLevel } from './common';

export type LoggerFilter = (data: LoggerData) => boolean;

export interface LoggerOptions {
  level: LoggerLevel;
  filter?: LoggerFilter;
  label: string[];
  transports: Transport | Transport[];
}
