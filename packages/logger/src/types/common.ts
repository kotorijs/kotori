import { LoggerFilter } from './internal';

export enum LoggerLevel {
  TRACE = 10,
  DEBUG = 20,
  RECORD = 25,
  INFO = 30,
  WARN = 40,
  ERROR = 50,
  FATAL = 60,
  SILENT = Infinity
}

export interface TransportOptionsBase {
  filter?: LoggerFilter;
}

export interface LoggerData {
  level: LoggerLevel;
  time: number;
  pid: number;
  label: string[];
  msg: string;
}
