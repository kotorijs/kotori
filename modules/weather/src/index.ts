import { type Context, Tsu, regExpExecAll } from 'kotori-bot'

const cityResponseSchema = Tsu.Object({
  city_list: Tsu.Array(
    Tsu.Object({
      cityId: Tsu.Number(),
      name: Tsu.String()
    })
  )
})

function handle(txt: string, q: string, h: string): string {
  const index = txt.indexOf(q)
  if (index === -1) return ''
  const startIndex = index + q.length
  const endIndex = txt.indexOf(h, startIndex)
  return endIndex === -1 ? '' : txt.substring(startIndex, endIndex).replace(/\s+/g, '')
}

export const lang = [__dirname, '../locales']

export const inject = ['cache']

export function main(ctx: Context) {
  ctx
    .command('weather <area> - weather.descr.weather')
    .option('L', 'limit:number - weather.option.weather.limit')
    .action(async ({ args: [area], options: { limit } }, session) => {
      if (limit && (limit > 6 || limit < 1)) throw session.error('num_error')

      const cityResponse =
        ctx.cache.get<Tsu.infer<typeof cityResponseSchema>>(area) ??
        cityResponseSchema.parse(await ctx.http.get(`http://m.moji.com/api/citysearch/${area}`))
      if (cityResponse.city_list.length === 0) throw session.error('data_error', { target: 'area' })

      const { cityId } = cityResponse.city_list[0]
      const weatherResponse = Tsu.String().parse(await ctx.http.get(`http://m.moji.com/api/redirect/${cityId}`))
      const weatherInfo = handle(weatherResponse, '<div class="weak_wea">', '<div class="exponent">')
      const temperatureMatches = regExpExecAll(/<lidata-high="(.*?)"data-low="(.*?)">/g, weatherInfo) || []
      const conditionMatches = regExpExecAll(/<dd><strong>(.*?)<\/strong><\/dd>/g, weatherInfo) || []
      const dateMatches = regExpExecAll(/<em>(.*?)<\/em>/g, weatherInfo) || []
      const airQualityMatches = regExpExecAll(/<pclass="(.*?)">(.*?)<\/p><dlclass="wind">/g, weatherInfo) || []
      const windMatches = regExpExecAll(/<dd>(.*?)<\/dd>/g, weatherInfo) || []

      let items = ''

      for (let i = 0; i < (limit || 1); i += 1) {
        items += session.format('weather.msg.weather.item', [
          dateMatches[i][1],
          temperatureMatches[i][2],
          temperatureMatches[i][1],
          conditionMatches[i * 2][1],
          conditionMatches[i * 2 + 1][1],
          windMatches[i * 2 + 2][1],
          windMatches[i * 4 + 3][1],
          airQualityMatches[i][2]
        ])
      }

      return session.format('weather.msg.weather', [cityResponse.city_list[0].name, items])
    })
}
