import type {  CommandParseResultExtra } from '../types';

export class CommandExtra {
	public value: CommandParseResultExtra[keyof CommandParseResultExtra];

	public constructor(value: CommandParseResultExtra[keyof CommandParseResultExtra]) {
		this.value = value;
	}
}

export default CommandExtra;
