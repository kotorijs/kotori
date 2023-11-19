import Kotori, { formatTime, isObj } from '@kotori-bot/kotori';
import { resolve } from 'path';

Kotori.uselang(resolve(__dirname, '../locales'));

Kotori.command('bili <bvid>')
	.action(async data => {
		const res = await Kotori.http.get('https://tenapi.cn/bv/', { id: data.args[0] });
		if (!isObj(res) || !isObj(res.data)) return 'BOT_RESULT.SERVER_ERROR';
		if (res.code !== 200 && typeof res.code === 'number')
			return ['bilibili.msg.bili.fail', { input: data.args[0] }];

		return [
			'bilibili.msg.bili',
			{
				...res.data,
				time: formatTime(new Date(res.data.time)),
				image: `[CQ:image,file=${res.data.cover}]`,
			},
		];
	})
	.help('bilibili.descr.bili');

Kotori.command('bilier <uid>')
	.action(async data => {
		const res = await Kotori.http.get('https://tenapi.cn/bilibili/', { uid: data.args[0] });
		if (!isObj(res) || !isObj(res.data)) return ['BOT_RESULT.SERVER_ERROR', { res }];
		if (!res.data.uid || !res.data.name) return ['bilibili.msg.bilier.fail', { input: data.args[0] }];
		const res2 = await Kotori.http.get('https://tenapi.cn/bilibilifo/', { uid: data.args[0] });

		return [
			'bilibili.msg.bilier',
			{
				...res2.data,
				...res.data,
				image: `[CQ:image,file=${res.data.avatar}]`,
			},
		];
	})
	.help('bilibili.descr.bilier');
