import { UserAccess, type Context, type JsonMap } from 'kotori-bot'
import type wikiData from './type'

export const lang = [__dirname, '../locales']

export const inject = ['file']

const defaultData = [
  {
    name: '萌娘百科',
    api: 'https://mzh.moegirl.org.cn/api.php'
  },
  {
    name: 'McWiki',
    api: 'https://minecraft.fandom.com/zh/api.php'
  }
]

export function main(ctx: Context) {
  function fetchWiki(wikiUrl: string, action: string, params: object) {
    return ctx.http.get(wikiUrl, {
      action,
      exintro: '',
      explaintext: '',
      prop: 'extracts',
      format: 'json',
      ...params
    })
  }

  async function wikiSearch(api: string, keyword: string) {
    const result = (await fetchWiki(api, 'query', {
      list: 'search',
      srsearch: keyword
      // biome-ignore lint:
    })) as any
    if (
      !result ||
      !result.query ||
      !result.query.search ||
      (Array.isArray(result.query.search) && result.query.search.length < 1)
    )
      return null

    let searchData = result.query.search
    if (Array.isArray(searchData)) {
      const [temp] = searchData
      searchData = temp
    }
    // biome-ignore lint:
    const data = (await fetchWiki(api, 'query', { pageids: searchData.pageid })) as any
    if (!data || !data.query || !data.query.pages || !data.query.pages[searchData.pageid]) return null
    return data.query.pages[searchData.pageid]
  }

  const loadWikiData = () => ctx.file.load<wikiData[]>('mediawiki.json', 'json', defaultData)
  const saveWikiData = (data: wikiData[]) => ctx.file.save('mediawiki.json', data)

  ctx.command('wiki <content> [order:number] - mediawiki.descr.wiki').action(async (data, session) => {
    const dataList = loadWikiData()
    if (dataList.length <= 0) return 'mediawiki.msg.wiki.empty'

    let res: JsonMap | null = null
    let wiki: wikiData | null = null
    const num = data.args[1] ?? 0
    if (num) {
      wiki = dataList[num - 1]
      if (!wiki || !wiki.api) return 'mediawiki.msg.wiki.error'
      res = await wikiSearch(wiki.api, data.args[0] as string)
    } else {
      let init = 0
      const query = async (): Promise<JsonMap | null> => {
        wiki = dataList[init]
        const res = await wikiSearch(wiki.api, data.args[0] as string)
        if (res || init >= dataList.length - 1) return res
        init += 1
        return query()
      }
      res = await query()
    }
    if (!res) return session.format('mediawiki.msg.wiki.fail', { input: data.args[0] })
    return session.format('mediawiki.msg.wiki', {
      ...res,
      url: `${wiki?.api.split('api.php')[0]}index.php?curid=${res.pageid}`,
      name: wiki?.name
    })
  })

  ctx.command('wikio query - mediawiki.descr.wikil').action((_, session) => {
    const dataList = loadWikiData()
    let list = ''
    let init = 1
    for (const value of dataList) {
      list += session.format('mediawiki.msg.wikil.list', { num: init, ...value })
      init += 1
    }
    return session.format('mediawiki.msg.wikil', { list })
  })

  ctx
    .command('wikio add <name> <url> - mediawiki.descr.wikio.add')
    .action((data, session) => {
      const [name, api] = data.args as string[]
      const list = loadWikiData()
      if (!api.includes('//') || !api.includes('api.php')) throw session.error('data_error', { target: 1 })
      list.push({ name, api })
      saveWikiData(list)
      return session.format('mediawiki.msg.wikio.add', { input: api })
    })
    .access(UserAccess.MANGER)

  ctx
    .command('wikio del <name> - mediawiki.descr.wikio.del')
    .action((data, session) => {
      const list = loadWikiData()
      const [name] = data.args as string[]
      saveWikiData(list.filter((content) => content.name !== name))
      return session.format('mediawiki.msg.wikio.del', { input: name })
    })
    .access(UserAccess.MANGER)
}
