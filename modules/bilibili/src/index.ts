import Kotori, { Tsu, formatTime } from 'kotori-bot';
import { resolve } from 'path';

const biliSchema = Tsu.Object({
	data: Tsu.Object({
		id: Tsu.String(),
		name: Tsu.String(),
		title: Tsu.String(),
		cover: Tsu.String(),
		description: Tsu.String(),
		sort: Tsu.String(),
		time: Tsu.Number(),
		view: Tsu.Number(),
		coin: Tsu.Number(),
		like: Tsu.Number(),
		collect: Tsu.Number(),
	}).optional(),
});

const bilierSchema = Tsu.Object({
	data: Tsu.Object({
		uid: Tsu.Any(),
		name: Tsu.String(),
		level: Tsu.Number(),
		sex: Tsu.String(),
		description: Tsu.String(),
		avatar: Tsu.String(),
		following: Tsu.Number(),
		follower: Tsu.Number(),
	}).optional(),
});

Kotori.uselang(resolve(__dirname, '../locales'));

Kotori.command('bili <bvid>')
	.action(async (data, session) => {
		const res = await Kotori.http.get('https://tenapi.cn/bv/', { id: data.args[0] });
		if (!biliSchema.check(res)) return session.error('res_error', { res });
		if (!res.data) return ['bilibili.msg.bili.fail', { input: data.args[0] }];
		return [
			'bilibili.msg.bili',
			{
				...res.data,
				time: formatTime(new Date(res.data.time)),
				image:
					(session.api.extra.type === 'onebot' && session.api.extra.image(res.data.cover)) ||
					'corei18n.template.empty',
			},
		];
	})
	.help('bilibili.descr.bili');

Kotori.command('bilier <uid>')
	.action(async (data, session) => {
		const res = Object.assign(
			(await Kotori.http.get('https://tenapi.cn/bilibilifo/', { uid: data.args[0] })) || {},
			await Kotori.http.get('https://tenapi.cn/bilibili/', { uid: data.args[0] }),
		);
		if (!bilierSchema.check(res)) return session.error('res_error', { res });
		if (!res.data) return ['bilibili.msg.bilier.fail', { input: data.args[0] }];
		return [
			'bilibili.msg.bilier',
			{
				...res.data,
				image:
					(session.api.extra.type === 'onebot' && session.api.extra.image(res.data.avatar)) ||
					'corei18n.template.empty',
			},
		];
	})
	.help('bilibili.descr.bilier');
