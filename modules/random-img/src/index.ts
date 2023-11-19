import Kotori, { isObj } from 'kotori-bot';
import { resolve } from 'path';
import config from './config';

Kotori.uselang(resolve(__dirname, '../locales'));

const image = (file: string) => `[CQ:image,file=${file},cache=0]`;

Kotori.command('sex [tags] - random_img.descr.sex').action(async data => {
	data.quick('random_img.msg.sex.tips');

	const res = await Kotori.http.get(`https://hotaru.icu/api/seimg/v2/`, { tag: data.args[0] || '', r18: 0 });
	if (!isObj(res)) return 'Server error!Please contact bot admin';
	if (res.code !== 500 || !Array.isArray(res.data)) return ['random_img.msg.sex.fail', { input: data.args[0] }];

	const dd = res.data[0];
	let tags = '';
	dd.tags.forEach((element: string) => {
		tags += `、${element}`;
	});
	data.quick(['random_img.msg.sex', { ...dd, tags: tags.substring(1) }]);
	return ['random_img.msg.sex.image', { image: image(dd.url) }];
});

Kotori.command('sexh - random_img.descr.sexh').action(async data => {
	data.quick('random_img.msg.sexh.tips');
	const res = await Kotori.http.get('https://hotaru.icu/api/huimg/');
	if (!isObj(res)) return 'Server error!Please contact bot admin';
	if (res.code !== 500 || !isObj(res.data)) return 'random_img.msg.sexh.fail';

	const dd = res.data;
	let tags = '';
	(dd.tag as string[]).forEach(element => {
		tags += `、${element}`;
	});
	return ['random_img.msg.sexh', { tags: tags.substring(1), image: image(dd.url) }];
});

Kotori.command('bing - random_img.descr.bing').action(() => [
	'random_img.msg.bing',
	{
		image: image(`https://api.hotaru.icu/api/bing`),
	},
]);

Kotori.command('day').action(() =>
	config.day.apiKey
		? [
				'random_img.msg.day',
				{
					image: image(`https://api.hotaru.icu/api/60s?apikey=${config.day.apiKey}&area=日本神户市`),
				},
		  ]
		: 'Apikey error!',
);

Kotori.command('earth - random_img.descr.earth').action(() => [
	'random_img.msg.earth',
	{
		image: image('https://img.nsmc.org.cn/CLOUDIMAGE/FY4A/MTCC/FY4A_DISK.jpg'),
	},
]);

Kotori.command('china - random_img.descr.china').action(() => [
	'random_img.msg.china',
	{
		image: image('https://img.nsmc.org.cn/CLOUDIMAGE/FY4A/MTCC/FY4A_CHINA.jpg'),
	},
]);
