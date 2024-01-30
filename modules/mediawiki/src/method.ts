import Kotori from 'kotori-bot';

export function fetchWiki(wikiUrl: string, action: string, params: object) {
  return Kotori.http.get(wikiUrl, {
    action,
    exintro: '',
    explaintext: '',
    prop: 'extracts',
    format: 'json',
    ...params,
  });
}

export async function wikiSearch(api: string, keyword: string) {
  const result = (await fetchWiki(api, 'query', {
    list: 'search',
    srsearch: keyword,
  })) as any;
  if (
    !result ||
    !result.query ||
    !result.query.search ||
    (Array.isArray(result.query.search) && result.query.search.length < 1)
  )
    return null;

  let searchData = result.query.search;
  if (Array.isArray(searchData)) {
    const { 0: temp } = searchData;
    searchData = temp;
  }
  const data = (await fetchWiki(api, 'query', { pageids: searchData.pageid })) as any;
  if (!data || !data.query || !data.query.pages || !data.query.pages[searchData.pageid]) return null;
  return data.query.pages[searchData.pageid];
}
