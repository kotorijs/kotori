import {
  Tsu,
  type Context,
  plugins,
  Symbols,
  CORE_MODULES,
  KotoriPlugin,
  FilterTestList,
  type FilterOption,
  Filter
} from 'kotori-bot'
import pm from 'picomatch'

declare module 'kotori-bot' {
  interface ModuleConfig {
    filter?: FilterOption
  }
}

const plugin = plugins([__dirname, '../'])

export const filterOptionBaseSchema = Tsu.Object({
  test: Tsu.Custom<FilterTestList>(
    (value) => typeof value === 'string' && Object.values(FilterTestList).includes(value as FilterTestList)
  ).describe('Testing item'),
  operator: Tsu.Union(
    Tsu.Literal('=='),
    Tsu.Literal('!='),
    Tsu.Literal('>'),
    Tsu.Literal('<'),
    Tsu.Literal('>='),
    Tsu.Literal('<=')
  ).describe('Testing operation'),
  value: Tsu.Union(Tsu.String(), Tsu.Number(), Tsu.Boolean()).describe('Expect value')
})

export const filterOptionGroupSchema = Tsu.Object({
  type: Tsu.Union(Tsu.Literal('all_of'), Tsu.Literal('any_of'), Tsu.Literal('none_of')),
  filters: Tsu.Array(filterOptionBaseSchema)
})

export const filterOptionSchema = Tsu.Union(filterOptionBaseSchema, filterOptionGroupSchema)

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

  private filterSet() {
    for (const [name, [, { filter }]] of this.ctx[Symbols.modules]) {
      if (!filter) continue
      const result = filterOptionSchema.parseSafe(filter)
      if (!result.value) {
        this.ctx.logger.error(`filter option of module ${name} is invalid`, result.error)
        continue
      }
      this.ctx[Symbols.filter].set(name, new Filter(result.data))
    }
  }
}
