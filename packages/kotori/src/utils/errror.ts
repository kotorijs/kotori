import type { DevErrorExtra } from '../types';
import CommandExtra from './commandExtra';

type KotoriErrorType =
	/* 'AdapterError' | */
	'DatabaseError' | 'ModuleError' | 'CoreError' | 'UnknownError' | 'CommandError' | 'DevError';
type KotoriErrorLevel = 'debug' | 'normal' | 'log';

interface KotoriErrorImpl {
	readonly name: KotoriErrorType;
	readonly level: KotoriErrorLevel;
	readonly extend: () => typeof KotoriError;
}

export class KotoriError<T extends object = object> extends Error implements KotoriErrorImpl {
	public constructor(
		message?: string,
		extra?: T,
		type: KotoriErrorType = 'UnknownError',
		level: KotoriErrorLevel = 'debug',
	) {
		super(message);
		this.name = type;
		this.level = level;
		this.extra = extra;
	}

	public readonly extra?: T;

	public readonly name: KotoriErrorType;

	public readonly level: KotoriErrorLevel;

	public extend(): typeof KotoriError {
		const { message: fatherMessage, name: fatherName, level: fatherLevel, extra: fatherExtra } = this;
		// const newConstructor: typeof KotoriError = Object.create(KotoriError);
		return new Proxy(KotoriError, {
			construct(Constructor, params) {
				const args = params;
				args[0] = `${fatherMessage} ${args[0]}`;
				args[1] = args[1] ?? fatherName;
				args[2] = args[2] ?? fatherLevel;
				args[3] = args[3] ?? fatherExtra;
				return new Constructor(...args);
			},
		});
	}
}

export const ModuleError = new KotoriError(undefined, undefined, 'ModuleError', 'normal').extend();
export const CoreError = new KotoriError(undefined, undefined, 'CoreError', 'normal').extend();
export const CommandError = new KotoriError<CommandExtra>(undefined, undefined, 'CommandError', 'normal').extend();
export const DevError = new KotoriError<DevErrorExtra>(undefined, undefined, 'DevError', 'debug').extend();

export default KotoriError;
