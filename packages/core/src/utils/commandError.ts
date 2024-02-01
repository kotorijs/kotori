import { CommandResultExtra } from '../types/index';
import { KotoriError } from './errror';

export class CommandError extends KotoriError {
  value: CommandResultExtra[keyof CommandResultExtra];

  constructor(value: CommandResultExtra[keyof CommandResultExtra]) {
    super();
    this.value = value;
  }
}

export default CommandError;
