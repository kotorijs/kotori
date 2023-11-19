import Kotori, { isObj, stringTemp } from '@kotori-bot/kotori';
import { resolve } from 'path';

const MAX_LIST = 10;

Kotori.uselang(resolve(__dirname, '../locales'));

Kotori.command('music <name> [order:number=1]').action(async (data, events) => {
	// const cache = `music${data.args[0]}`;
	const res = /* Cache.get(cache) ||  */ await Kotori.http.get('https://api.hotaru.icu/api/netease', {
		name: data.args[0],
	});
	if (!isObj(res)) return 'music.msg.music.fail.server';
	// Cache.set(cache, res);
	if (res.code !== 500 || !Array.isArray(res.data)) return ['music.msg.music.fail', { input: data.args[0] }];

	if (data.args[1] === 0) {
		let list = '';
		for (let init = 0; init < (res.data.length > MAX_LIST ? MAX_LIST : res.data.length); init += 1) {
			const song = res.data[init];
			list += stringTemp(events.locale('music.msg.music.list'), {
				num: init + 1,
				title: song.title ?? '',
				author: song.author ?? '',
			});
		}
		return ['music.msg.music.lists', { list }];
	}

	const song = res.data[(data.args[1] as number) - 1];
	if (!song) return 'music.msg.music.fail.order';

	if (events.api.adapter.platform === 'qq') events.send(`[CQ:music,type=163,id=${song.songid}`);

	return [
		'music.msg.music',
		{
			...song,
			image: typeof song.pic === 'string' ? `[CQ:image,file=${song.pic}]` : '',
		},
	];
});
