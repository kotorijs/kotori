import { Tsu, type Context, plugins, Symbols, CORE_MODULES, KotoriPlugin } from 'kotori-bot'
import pm from 'picomatch'

const plugin = plugins([__dirname, '../'])
// TODO: modules context filter
@plugin.import
export class FilterPlugin extends KotoriPlugin<Tsu.infer<typeof FilterPlugin.schema>> {
  @plugin.schema
  public static schema = Tsu.Object({
    mode: Tsu.Union(Tsu.Literal('include'), Tsu.Literal('exclude')).default('exclude'),
    list: Tsu.Array(Tsu.String()).default([])
  })

  public constructor(ctx: Context, config: Tsu.infer<typeof FilterPlugin.schema>) {
    super(ctx, config)
    this.loaderFilter()
  }

  private loaderFilter() {
    const { mode, list } = this.config
    const runner = this.ctx.get<{ [Symbols.modules]: Map<string, [{ main?: string }, object]> }>('runner')
    if (!runner) {
      this.ctx.logger.error('it is not loader environment nowadays')
      return
    }
    this.ctx.logger.record(`get loader successfully, filter mode: ${mode}`)
    runner[Symbols.modules].forEach((val, key) => {
      if (CORE_MODULES.includes(key)) return
      const [ModuleMeta] = val
      const result = list.filter((pattern) => pm(pattern)(key).valueOf()).length > 0
      if ((result && mode === 'exclude') || (!result && mode === 'include')) {
        runner[Symbols.modules].delete(key)
        // biome-ignore lint:
        delete ModuleMeta.main
      }
    })
  }
}

// plugin.import(Plugin);
