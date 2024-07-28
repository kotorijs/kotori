export namespace Symbols {
  export const adapter = Symbol.for('kotori.core.adapter')
  export const bot = Symbol.for('kotori.core.bot')
  export const midware = Symbol.for('kotori.core.midware')
  export const command = Symbol.for('kotori.core.command')
  export const regexp = Symbol.for('kotori.core.regexp')
  export const task = Symbol.for('kotori.core.task')
  export const filter = Symbol.for('kotori.core.filter')
  export const promise = Symbol.for('kotori.core.promise')
  export const modules = Symbol.for('kotori.loader.module')
}

export default Symbols
