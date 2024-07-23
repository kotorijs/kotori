export class Symbols {
  public static readonly adapter = Symbol.for('kotori.core.adapter')
  public static readonly bot = Symbol.for('kotori.core.bot')
  public static readonly midware = Symbol.for('kotori.core.midware')
  public static readonly command = Symbol.for('kotori.core.command')
  public static readonly regexp = Symbol.for('kotori.core.regexp')
  public static readonly filter = Symbol.for('kotori.core.filter')
  public static readonly modules = Symbol.for('kotori.loader.module')
  public static readonly job = Symbol.for('kotori.loader.job')
}

export default Symbols
