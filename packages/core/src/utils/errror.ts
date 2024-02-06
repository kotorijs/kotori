type KotoriErrorType = 'DatabaseError' | 'ModuleError' | 'UnknownError' | 'DevError';

interface KotoriErrorImpl {
  readonly name: KotoriErrorType;
  readonly extend: () => typeof KotoriError;
}

export class KotoriError<T extends object = object> extends Error implements KotoriErrorImpl {
  constructor(message?: string, extra?: T, type: KotoriErrorType = 'UnknownError') {
    super(message);
    this.name = type;
    this.extra = extra;
  }

  readonly extra?: T;

  readonly name: KotoriErrorType;

  extend(): typeof KotoriError<T> {
    const { message: fatherMessage, name: fatherType, extra: fatherExtra } = this;
    // const newClass: typeof KotoriError = Object.create(KotoriError);
    return new Proxy(KotoriError<T>, {
      construct(Class, params) {
        const args = params;
        args[0] = `${fatherMessage} ${args[0]}`;
        args[1] = args[1] ?? fatherExtra;
        args[2] = args[2] ?? fatherType;
        return new Class(...args);
      }
    });
  }
}

export const ModuleError = new KotoriError(undefined, undefined, 'ModuleError').extend();
export const DevError = new KotoriError(undefined, undefined, 'DevError').extend();

export default KotoriError;
