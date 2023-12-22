import Kotori, { Tsu, stringTemp } from 'kotori-bot';
import { resolve } from 'path';

const musicSchema = Tsu.Object({
	data: Tsu.Array(
		Tsu.Object({
			link: Tsu.String(),
			songid: Tsu.Number(),
			title: Tsu.String(),
			author: Tsu.String(),
			url: Tsu.String(),
			pic: Tsu.String(),
		}),
	).optional(),
});

const MAX_LIST = 10;

Kotori.uselang(resolve(__dirname, '../locales'));

Kotori.command('music <name> [order:number=1] - music.descr.music')
	.action(async (data, session) => {
		/* here need cache */
		// const cache = `music${data.args[0]}`;
		const res = /* Cache.get(cache) ||  */ musicSchema.parse(
			await Kotori.http.get('https://api.hotaru.icu/api/netease', {
				name: data.args[0],
			}),
		);
		// Cache.set(cache, res);
		if (!res.data) return ['music.msg.music.fail', { input: data.args[0] }];

		if (data.args[1] === 0) {
			let list = '';
			for (let init = 0; init < (res.data.length > MAX_LIST ? MAX_LIST : res.data.length); init += 1) {
				const song = res.data[init];
				list += stringTemp(session.locale('music.msg.music.list'), {
					num: init + 1,
					title: song.title ?? '',
					author: song.author ?? '',
				});
			}
			return ['music.msg.music.lists', { list }];
		}

		const song = res.data[(data.args[1] as number) - 1];
		if (!song) return 'music.msg.music.fail.order';

		if (session.api.adapter.platform === 'onebot') session.send(`[CQ:music,type=163,id=${song.songid}`);

		return [
			'music.msg.music',
			{
				...song,
				image: session.el.image(song.pic),
			},
		];
	})
	.help('music.help.music');
