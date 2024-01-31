export class Symbols {
  static readonly container = Symbol.for('kotori.context.container');

  static readonly containerKey = (prop: string) => Symbol.for(`kotori.context.container.${prop}`);

  /* custom */
  static readonly midware = Symbol.for('kotori.custom.midware');

  static readonly command = Symbol.for('kotori.custom.command');

  static readonly regexp = Symbol.for('kotori.custom.regexp');
}

export default Symbols;
