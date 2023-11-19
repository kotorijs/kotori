import Kotori from '@kotori-bot/kotori';

export const fetchWiki = (wikiUrl: string, action: string, params: object) => {
	const promise = Kotori.http.get(wikiUrl, {
		action,
		exintro: '',
		explaintext: '',
		prop: 'extracts',
		format: 'json',
		...params,
	});
	return promise;
};

export const wikiSearch = async (api: string, keyword: string) => {
	const result = await fetchWiki(api, 'query', {
		list: 'search',
		srsearch: keyword,
	});
	if (
		!result ||
		!result.query ||
		!result.query.search ||
		(Array.isArray(result.query.search) && result.query.search.length < 1)
	)
		return null;

	let searchData = result.query.search;
	if (Array.isArray(searchData)) searchData = searchData[0];
	const data = await fetchWiki(api, 'query', { pageids: searchData.pageid });
	if (!data || !data.query || !data.query.pages || !data.query.pages[searchData.pageid]) return null;
	return data.query.pages[searchData.pageid];
};
