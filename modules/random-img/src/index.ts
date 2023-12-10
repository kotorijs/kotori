import Kotori, { type Api, Tsu } from 'kotori-bot';
import { resolve } from 'path';
import config from './config';

const sexSchema = Tsu.Object({
	data: Tsu.Array(
		Tsu.Object({
			pid: Tsu.Number(),
			title: Tsu.String(),
			author: Tsu.String(),
			tags: Tsu.Array(Tsu.String()),
			url: Tsu.String(),
		}),
	).optional(),
});

const sexhSchema = Tsu.Object({
	data: Tsu.Object({
		url: Tsu.String(),
		tag: Tsu.Array(Tsu.String()),
	}).optional(),
});

const quick = (url: string, api: Api) =>
	api.extra.type === 'onebot' ? api.extra.image(url) : 'corei18n.template.empty';

Kotori.uselang(resolve(__dirname, '../locales'));

Kotori.command('sex [tags] - random_img.descr.sex').action(async (data, session) => {
	session.quick('random_img.msg.sex.tips');
	const res = sexSchema.parse(await Kotori.http.get(`https://hotaru.icu/api/seimg/v2/`, { tag: data.args[0] || '', r18: 0 }));
	if (!res.data) return ['random_img.msg.sex.fail', { input: data.args[0] }];

	const info = res.data[0];
	session.quick(['random_img.msg.sex', { ...info, tags: info.tags.join(' ') }]);
	if (session.api.extra.type !== 'onebot') return '';
	return ['random_img.msg.sex.image', { image: session.api.extra.image(info.url) }];
});

Kotori.command('sexh - random_img.descr.sexh').action(async (data, session) => {
	session.quick('random_img.msg.sexh.tips');
	const res = sexhSchema.parse(await Kotori.http.get('https://hotaru.icu/api/huimg/'));
	if (!res.data) return ['random_img.msg.sexh.fail', { input: data.args[0] }];
	const info = res.data;
	if (session.api.extra.type !== 'onebot') return '';
	return ['random_img.msg.sexh', { tags: info.tag.join(' '), image: session.api.extra.image(info.url) }];
});

Kotori.command('bing - random_img.descr.bing').action((_, session) => [
	'random_img.msg.bing',
	{
		image: quick('https://api.hotaru.icu/api/bing', session.api),
	},
]);

Kotori.command('day').action((_, session) =>
	config.day.apiKey
		? [
				'random_img.msg.day',
				{
					image: quick(
						`https://api.hotaru.icu/api/60s?apikey=${config.day.apiKey}&area=日本神户市`,
						session.api,
					),
				},
		  ]
		: 'Apikey error!',
);

Kotori.command('earth - random_img.descr.earth').action((_, session) => [
	'random_img.msg.earth',
	{
		image: quick('https://img.nsmc.org.cn/CLOUDIMAGE/FY4A/MTCC/FY4A_DISK.jpg', session.api),
	},
]);

Kotori.command('china - random_img.descr.china').action((_, session) => [
	'random_img.msg.china',
	{
		image: quick('https://img.nsmc.org.cn/CLOUDIMAGE/FY4A/MTCC/FY4A_CHINA.jpg', session.api),
	},
]);
