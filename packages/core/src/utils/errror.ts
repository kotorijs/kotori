interface DevErrorExtra {
  path: string;
  type: 'warning' | 'info' | 'error';
}

type KotoriErrorType = 'DatabaseError' | 'ModuleError' | 'UnknownError' | 'DevError';
type KotoriErrorLevel = 'debug' | 'normal' | 'log';

interface KotoriErrorImpl {
  readonly name: KotoriErrorType;
  readonly level: KotoriErrorLevel;
  readonly extend: () => typeof KotoriError;
}

export class KotoriError<T extends object = object> extends Error implements KotoriErrorImpl {
  constructor(message?: string, extra?: T, type: KotoriErrorType = 'UnknownError', level: KotoriErrorLevel = 'debug') {
    super(message);
    this.name = type;
    this.level = level;
    this.extra = extra;
  }

  readonly extra?: T;

  readonly name: KotoriErrorType;

  readonly level: KotoriErrorLevel;

  extend(): typeof KotoriError<T> {
    const { message: fatherMessage, name: fatherType, level: fatherLevel, extra: fatherExtra } = this;
    // const newClass: typeof KotoriError = Object.create(KotoriError);
    return new Proxy(KotoriError<T>, {
      construct(Class, params) {
        const args = params;
        args[0] = `${fatherMessage} ${args[0]}`;
        args[1] = args[1] ?? fatherExtra;
        args[2] = args[2] ?? fatherType;
        args[3] = args[3] ?? fatherLevel;
        return new Class(...args);
      }
    });
  }
}

export const ModuleError = new KotoriError(undefined, undefined, 'ModuleError', 'normal').extend();
export const DevError = new KotoriError<DevErrorExtra>(undefined, undefined, 'DevError', 'debug').extend();

export default KotoriError;
