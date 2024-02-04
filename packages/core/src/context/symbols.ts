export class Symbols {
  static readonly container = Symbol.for('kotori.context.container');

  static readonly table = Symbol.for('kotori.context.table');

  static readonly containerKey = (prop: string) => Symbol.for(`kotori.context.container.${prop}`);

  /* custom */
  static readonly service = Symbol.for('kotori.core.service');

  static readonly adapter = Symbol.for('kotori.core.adapter');

  static readonly bot = Symbol.for('kotori.core.bot');

  static readonly midware = Symbol.for('kotori.core.midware');

  static readonly command = Symbol.for('kotori.core.command');

  static readonly regexp = Symbol.for('kotori.core.regexp');

  static readonly modules = Symbol.for('kotori.loader.module');
}

export default Symbols;
