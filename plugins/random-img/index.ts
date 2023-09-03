import path from 'path';
import { Core, fetchJ, temp } from 'plugins/kotori-core';
import { BOT_RESULT, CoreVal, URL } from 'plugins/kotori-core/type';
import SDK from '@/utils/class.sdk';
import { Locale, isObj } from '@/tools';
import config from './config';

Locale.register(path.resolve(__dirname));

const Cmd = (keyword: string, callback: CoreVal) => {
	const result = Core.cmd(keyword, callback).menuId('randomImg');
	return result;
};

Cmd('sex', async send => {
	send('random_img.msg.sex.tips');

	const res = await fetchJ(`https://imlolicon.tk/api/seimg/v2/`, { tag: Core.args[1], r18: 0 });
	if (!isObj(res)) return [BOT_RESULT.SERVER_ERROR, { res }];
	if (res.code !== 500 || !Array.isArray(res.data)) return ['random_img.msg.sex.fail', { input: Core.args[1] }];

	const dd = res.data[0];
	let tags = '';
	dd.tags.forEach((element: string) => {
		tags += `、${element}`;
	});
	send('random_img.msg.sex.info', {
		...dd,
		tags: tags.substring(1),
	});
	return [
		'random_img.msg.sex.image',
		{
			image: SDK.cq_image(dd.url),
		},
	];
})
	.help('random_img.help.sex')
	.params([
		{
			must: false,
			name: 'tags',
		},
	]);

Cmd('sexh', async send => {
	send('random_img.msg.sexh.tips');
	const res = await fetchJ('https://imlolicon.tk/api/huimg/', { tag: Core.args[1] });
	if (!isObj(res)) return [BOT_RESULT.SERVER_ERROR, { res }];
	if (res.code !== 500 || !isObj(res.data)) return ['random_img.msg.sexh.fail', { input: Core.args[1] }];

	const dd = res.data;
	let tags = '';
	(dd.tag as string[]).forEach(element => {
		tags += `、${element}`;
	});
	return [
		'random_img.msg.sexh.info',
		{
			tags: tags.substring(1),
			image: SDK.cq_image(dd.url),
		},
	];
})
	.help('random_img.help.sexh')
	.params([
		{
			must: false,
			name: 'tags',
		},
	]);

Cmd('seller', () =>
	temp('random_img.msg.seller.info', {
		image: SDK.cq_image(`${URL.API}sellerimg`),
	}),
).help('random_img.help.seller');

Cmd('sedimg', () =>
	temp('random_img.msg.sedimg.info', {
		image: SDK.cq_image(`${URL.API}sedimg`),
	}),
).help('random_img.help.sedimg');

Cmd('bing', () =>
	temp('random_img.msg.bing.info', {
		image: SDK.cq_image(`${URL.API}bing`),
	}),
).help('random_img.help.bing');

Cmd('day', () =>
	config.day.apiKey
		? temp('random_img.msg.day.info', {
				image: SDK.cq_image(`${URL.API}60s?apikey=${config.day.apiKey}&area=日本神户市`),
		  })
		: BOT_RESULT.APIKEY_EMPTY,
).help('random_img.help.day');

Cmd('earth', () =>
	temp('random_img.msg.earth.info', {
		image: SDK.cq_image('https://img.nsmc.org.cn/CLOUDIMAGE/FY4A/MTCC/FY4A_DISK.jpg'),
	}),
).help('random_img.help.earth');

Cmd('china', () =>
	temp('random_img.msg.china.info', {
		image: SDK.cq_image('https://img.nsmc.org.cn/CLOUDIMAGE/FY4A/MTCC/FY4A_CHINA.jpg'),
	}),
).help('random_img.help.china');

Cmd('sister', () =>
	temp('random_img.msg.sister.info', {
		video: SDK.cq_video(`${URL.API}sisters`),
	}),
).help('random_img.help.sister');

Cmd('qrcode', () => {
	const frame = ['L', 'M', 'Q', 'H'][parseInt(Core.args[2], 10)];
	if (!frame) {
		return 'random_img.msg.qrcode.fail';
	}
	return temp('random_img.msg.qrcode.info', {
		image: SDK.cq_image(`${URL.API}qrcode?text=${Core.args[1]}&frame=2&size=200&e=${frame}`),
	});
})
	.help('random_img.help.qrcode')
	.params([
		{
			must: true,
			name: 'content',
		},
		{
			must: '3',
			name: 'level',
		},
	]);
