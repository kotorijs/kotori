import {
  Tsu,
  type Context,
  plugins,
  Symbols,
  CORE_MODULES,
  KotoriPlugin,
  type FilterOption,
  Filter,
  KotoriError,
  filterOptionSchema
} from 'kotori-bot'
import pm from 'picomatch'

declare module 'kotori-bot' {
  interface ModuleConfig {
    filter?: FilterOption
  }
}

const plugin = plugins([__dirname, '../'])

@plugin.import
export class FilterPlugin extends KotoriPlugin<Tsu.infer<typeof FilterPlugin.schema>> {
  @plugin.schema
  public static schema = Tsu.Object({
    mode: Tsu.Union(Tsu.Literal('include'), Tsu.Literal('exclude')).default('exclude').describe('Filter mode'),
    list: Tsu.Array(Tsu.String()).default([]).describe('Filter list (supports string match)')
  })

  public constructor(ctx: Context, config: Tsu.infer<typeof FilterPlugin.schema>) {
    super(ctx, config)
    this.filterModules()
    this.filterSet()
  }

  private filterModules() {
    const { mode, list } = this.config
    // const runner = this.ctx.get<{ [Symbols.modules]: Map<string, [{ main?: string }, object]> }>('runner')
    // if (!runner) {
    //   this.ctx.logger.error('it is not loader environment nowadays')
    //   return
    // }
    this.ctx.logger.record(`get loader successfully, filter mode: ${mode}`)

    for (const [key, [ModuleMeta]] of this.ctx[Symbols.modules]) {
      if (CORE_MODULES.includes(key)) return
      const result = list.some((pattern) => pm(pattern)(key).valueOf())
      if ((result && mode === 'exclude') || (!result && mode === 'include')) {
        this.ctx[Symbols.modules].delete(key)
        ;(ModuleMeta as { main?: unknown }).main = undefined
      }
    }
  }

  private filterSet() {
    for (const [name, [, { filter }]] of this.ctx[Symbols.modules]) {
      if (!filter) continue
      const result = filterOptionSchema.parseSafe(filter)
      if (!result.value) {
        this.ctx.emit('error', new KotoriError(`filter option of module ${name} is invalid: ${result.error.message}`))
        continue
      }
      this.ctx[Symbols.filter].set(name, new Filter(result.data))
    }
  }
}
