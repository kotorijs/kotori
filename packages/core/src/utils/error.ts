import type { CommandResultExtra } from '../types'

interface KotoriErrorImpl extends Error {
  readonly label?: string
  readonly extend: () => typeof KotoriError
}

/**
 * Kotori error
 *
 * @class KotoriError
 * @extends {Error}
 */
export class KotoriError extends Error implements KotoriErrorImpl {
  /**
   * Creates an instance of `KotoriError`.
   *
   * @param - Error message
   * @param - Error label
   */
  public constructor(message?: string, label?: string) {
    super(message)
    this.name = label ? `${label.charAt(0).toUpperCase()}${label.slice(1)}Error` : 'KotoriError'
    this.label = label
  }

  /** Error label */
  public readonly label?: string

  public extend() {
    return new Proxy(KotoriError, {
      construct: (target, args, newTarget) =>
        Reflect.construct(
          target,
          [`${this.message ? `${this.message} ` : ''}${args[0]}`, args[1] ?? this.label],
          newTarget
        )
    })
  }

  public static from(err: unknown, label?: string) {
    const origin = err instanceof Error ? err : new Error(String(err))
    const error = new KotoriError(origin.message, label ?? origin.name)
    if (origin.cause) error.cause = origin.cause
    if (origin.stack) error.stack = origin.stack
    return error
  }
}

/**
 * Module error
 *
 * @class ModuleError
 * @extends {KotoriError}
 */
export const ModuleError = new KotoriError(undefined, 'module').extend()

/**
 * Dev error
 *
 * @class DevError
 * @extends {KotoriError}
 */
export const DevError = new KotoriError(undefined, 'dev').extend()

/**
 * Command error
 *
 * @class CommandError
 * @extends {KotoriError}
 */
export class CommandError extends KotoriError {
  public readonly value: CommandResultExtra[keyof CommandResultExtra]

  public constructor(value: CommandResultExtra[keyof CommandResultExtra]) {
    super()
    this.value = value
  }
}
