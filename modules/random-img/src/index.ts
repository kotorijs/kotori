import Kotori, { isObj } from 'kotori-bot';
import { resolve } from 'path';
import config from './config';

Kotori.uselang(resolve(__dirname, '../locales'));

const image = (file: string) => `[CQ:image,file=${file}]`;

Kotori.command('sex [tags]')
	.action(async data => {
		data.quick('random_img.msg.sex.tips');

		const res = await Kotori.http.get(`https://hotaru.icu/api/seimg/v2/`, { tag: data.args[0] || '', r18: 0 });
		if (!isObj(res)) return 'Server error!Please contact bot admin';
		if (res.code !== 500 || !Array.isArray(res.data)) return ['random_img.msg.sex.fail', { input: data.args[0] }];

		const dd = res.data[0];
		let tags = '';
		dd.tags.forEach((element: string) => {
			tags += `、${element}`;
		});
		data.quick(['random_img.msg.sex.info', { ...dd, tags: tags.substring(1) }]);
		return ['random_img.msg.sex.image', { image: image(dd.url) }];
	})
	.help('random_img.help.sex');

Kotori.command('sexh')
	.action(async data => {
		data.quick('random_img.msg.sexh.tips');
		const res = await Kotori.http.get('https://hotaru.icu/api/huimg/');
		if (!isObj(res)) return 'Server error!Please contact bot admin';
		if (res.code !== 500 || !isObj(res.data)) return 'random_img.msg.sexh.fail';

		const dd = res.data;
		let tags = '';
		(dd.tag as string[]).forEach(element => {
			tags += `、${element}`;
		});
		return ['random_img.msg.sexh.info', { tags: tags.substring(1), image: image(dd.url) }];
	})
	.help('random_img.help.sexh');

Kotori.command('bing')
	.action(() => [
		'random_img.msg.bing.info',
		{
			image: image(`https://api.hotaru.icu/api/bing`),
		},
	])
	.help('random_img.help.bing');

Kotori.command('day')
	.action(() =>
		config.day.apiKey
			? [
					'random_img.msg.day.info',
					{
						image: image(`https://api.hotaru.icu/api/60s?apikey=${config.day.apiKey}&area=日本神户市`),
					},
			  ]
			: 'Apikey error!',
	)
	.help('random_img.help.day');

Kotori.command('earth')
	.action(() => [
		'random_img.msg.earth.info',
		{
			image: image('https://img.nsmc.org.cn/CLOUDIMAGE/FY4A/MTCC/FY4A_DISK.jpg'),
		},
	])
	.help('random_img.help.earth');

Kotori.command('china')
	.action(() => [
		'random_img.msg.china.info',
		{
			image: image('https://img.nsmc.org.cn/CLOUDIMAGE/FY4A/MTCC/FY4A_CHINA.jpg'),
		},
	])
	.help('random_img.help.china');
