import { Tsu, Context, plugins, Symbols } from 'kotori-bot';
import pm from 'picomatch';

type ModuleMap = [{ pkg: string }, object];

const plugin = plugins([__dirname, '../']);

@plugin.import
export default class Plugin {
  private ctx: Context;

  private config: Tsu.infer<typeof Plugin.schema>;

  @plugin.schema
  public static schema = Tsu.Object({
    mode: Tsu.Union([Tsu.Literal('include'), Tsu.Literal('exclude')]).default('exclude'),
    list: Tsu.Array(Tsu.String()).default([])
  });

  public constructor(ctx: Context, config: Tsu.infer<typeof Plugin.schema>) {
    this.ctx = ctx;
    this.config = config;
    this.loaderFilter();
  }

  private loaderFilter() {
    const { mode, list } = this.config;
    const runner = this.ctx.get<{ [Symbols.modules]: Map<string, ModuleMap> }>('runner');
    if (!runner) {
      this.ctx.logger.error('it is not loader environment nowadays');
      return;
    }
    this.ctx.logger.record(`get loader successfully, filter mode: ${mode}`);
    runner[Symbols.modules].forEach((val, key) => {
      const value = [runner[Symbols.modules].get(key)];
      const result = list.filter((pattern) => pm(pattern)(key).valueOf()).length > 0;
      if (result && (mode === 'exclude' || mode === undefined)) {
        delete value[0];
        console.log(value[0], value[0] === val);
      } else if (!result && mode === 'include') {
        delete value[0];
      }
    });
  }
}
