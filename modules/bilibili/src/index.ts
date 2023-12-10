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

const bilier1Schema = Tsu.Object({
	data: Tsu.Object({
		following: Tsu.Number(),
		follower: Tsu.Number(),
	}).optional(),
});

const bilier2Schema = Tsu.Object({
	data: Tsu.Object({
		name: Tsu.String(),
		level: Tsu.Number(),
		sex: Tsu.String(),
		description: Tsu.String(),
		avatar: Tsu.String(),
	}).optional(),
});

Kotori.uselang(resolve(__dirname, '../locales'));

Kotori.command('bili <bvid> - bilibili.descr.bili')
	.action(async (data, session) => {
		const res = biliSchema.parse(await Kotori.http.get('https://tenapi.cn/bv/', { id: data.args[0] }));
		if (!res.data) return ['bilibili.msg.bili.fail', { input: data.args[0] }];
		return [
			'bilibili.msg.bili',
			{
				...res.data,
				time: formatTime(new Date(res.data.time)),
				image:
					(session.api.extra.type === 'onebot' && session.api.extra.image(res.data.cover)) || 'corei18n.template.empty',
			},
		];
	});

Kotori.command('bilier <uid> - bilibili.descr.bilier')
	.action(async (data, session) => {
		const res = Object.assign(
			bilier1Schema.parse(await Kotori.http.get('https://tenapi.cn/bilibilifo/', { uid: data.args[0] })).data || {},
			bilier2Schema.parse(await Kotori.http.get('https://tenapi.cn/bilibili/', { uid: data.args[0] })).data,
		);
		if (!res) return ['bilibili.msg.bilier.fail', { input: data.args[0] }];
		return [
			'bilibili.msg.bilier',
			{
				...res,
				image:
					(session.api.extra.type === 'onebot' && session.api.extra.image(res.avatar)) || 'corei18n.template.empty',
			},
		];
	});
