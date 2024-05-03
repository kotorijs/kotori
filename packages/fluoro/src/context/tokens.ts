export class Tokens {
  public static readonly container = Symbol.for('kotori.context.container');

  public static readonly table = Symbol.for('kotori.context.table');

  public static readonly containerKey = (prop: string) => Symbol.for(`kotori.context.container.${prop}`);
}

export default Tokens;
