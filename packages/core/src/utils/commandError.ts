import { CommandResultExtra } from '../types';
import { KotoriError } from './error';

export class CommandError extends KotoriError {
  public readonly value: CommandResultExtra[keyof CommandResultExtra];

  public constructor(value: CommandResultExtra[keyof CommandResultExtra]) {
    super();
    this.value = value;
  }
}

export default CommandError;
