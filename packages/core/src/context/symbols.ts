export class Symbols {
  public static readonly container = Symbol.for('kotori.context.container');

  public static readonly table = Symbol.for('kotori.context.table');

  public static readonly containerKey = (prop: string) => Symbol.for(`kotori.context.container.${prop}`);

  /* custom */
  // static readonly service = Symbol.for('kotori.core.service');

  public static readonly adapter = Symbol.for('kotori.core.adapter');

  public static readonly bot = Symbol.for('kotori.core.bot');

  public static readonly midware = Symbol.for('kotori.core.midware');

  public static readonly command = Symbol.for('kotori.core.command');

  public static readonly regexp = Symbol.for('kotori.core.regexp');

  public static readonly modules = Symbol.for('kotori.loader.module');
}

export default Symbols;
