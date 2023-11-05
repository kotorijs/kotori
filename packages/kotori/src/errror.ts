type KotoriErrorType = /* 'AdapterError' | */ 'DatabaseError' | 'ModuleError' | 'CoreError' | 'UnknownError';
type KotoriErrorLevel = 'debug' | 'normal';

interface IKotoriError {
	readonly name: KotoriErrorType;
	readonly level: KotoriErrorLevel;
	readonly extend: () => typeof KotoriError;
}

export class KotoriError extends Error implements IKotoriError {
	public constructor(message?: string, type: KotoriErrorType = 'UnknownError', level: KotoriErrorLevel = 'debug') {
		super(message);
		this.name = type;
		this.level = level;
	}

	public readonly name: KotoriErrorType;

	public readonly level: KotoriErrorLevel;

	public readonly extend = (): typeof KotoriError => {
		const { message: fatherMessage, name: fatherName, level: fatherLevel } = this;
		return class extends KotoriError implements IKotoriError {
			public constructor(
				message?: string,
				type: KotoriErrorType = fatherName,
				level: KotoriErrorLevel = fatherLevel,
			) {
				super(`${fatherMessage} ${message}`, type, level);
			}
		};
	};
}

export default KotoriError;
