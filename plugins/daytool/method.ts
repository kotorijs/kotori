import { FuncFetchSuper, fetchJson, obj } from '@/tools';
import config from './config';

export const fetchBGM: FuncFetchSuper<obj> = async (url, params) => {
	const newParams = { ...params, token: config.bangumi.apiKey };
	return fetchJson(`https://api.bgm.tv/${url}`, newParams, {
		headers: {
			'user-agent': 'czy0729/Bangumi/6.4.0 (Android) (http://github.com/czy0729/Bangumi)',
		},
	});
};
export const a = {};
