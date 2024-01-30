import type { CommandParseResultExtra } from '../types';

export class CommandExtra {
  value: CommandParseResultExtra[keyof CommandParseResultExtra];

  constructor(value: CommandParseResultExtra[keyof CommandParseResultExtra]) {
    this.value = value;
  }
}

export default CommandExtra;
