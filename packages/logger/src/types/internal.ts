import { Transport } from '../utils/transport';
import { LoggerLevel } from './common';

export interface LoggerData {
  level: LoggerLevel;
  time: number;
  pid: number;
  label: string[];
  msg: string;
}

export type LoggerFilter = (data: LoggerData) => boolean;

export interface LoggerOptions {
  level: LoggerLevel;
  filter?: LoggerFilter;
  label: string[];
  transports: Transport | Transport[];
}
