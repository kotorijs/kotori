import path from 'path';
import { Cache, Core, fetchT, getQq, temp } from 'plugins/kotori-core';
import { fetchJ } from 'plugins/kotori-core/method';
import { BOT_RESULT, CoreVal } from 'plugins/kotori-core/type';
import cheerio from 'cheerio';
import { Locale, formatTime, isObj, obj } from '@/tools';
import SDK from '@/utils/class.sdk';
import { fetchBGM } from './method';
import config from './config';

const { maxList } = config;

Locale.register(path.resolve(__dirname));

const Kotori.command(keyword: string, callback: CoreVal)  {
	const result = Core.cmd(keyword, callback).menuId('dayTool');
	return result;
};

Kotori.command('music').action( async send => {
	const cache = `music${data.args[0]}`;
	const res = Cache.get(cache) || (await fetchJ('netease', { name: data.args[0] }));
	if (!isObj(res)) return [BOT_RESULT.SERVER_ERROR, { res }];
	Cache.set(cache, res);
	if (res.code !== 500 || !Array.isArray(res.data)) return ['daytool.msg.music.fail', { input: data.args[0] }];

	const num = parseInt(data.args[1], 10);
	if (num === 0) {
		let list = '';
		for (let init = 0; init < (res.data.length > maxList ? maxList : res.data.length); init += 1) {
			const song = res.data[init];
			list += temp('daytool.msg.music.list', {
				num: init + 1,
				title: typeof song.title === 'string' ? song.title : BOT_RESULT.EMPTY,
				author: typeof song.author === 'string' ? song.author : BOT_RESULT.EMPTY,
			});
		}
		return ['daytool.msg.music.lists', { list }];
	}

	const song = res.data[num - 1];
	if (!song) return BOT_RESULT.NUM_ERROR;

	send(SDK.cq_Music('163', song.songid));

	return [
		'daytool.msg.music',
		{
			...song,
			image: typeof song.pic === 'string' ? SDK.cq_image(song.pic) : BOT_RESULT.EMPTY,
		},
	];
})
	.help('daytool.descr.music')
	.params([
		{
			must: true,
			name: 'music',
		},
		{
			must: '1',
			name: 'num',
		},
	]);

Kotori.command('bili').action( async () => {
	const res = await fetchJ('https://tenapi.cn/bv/', { id: data.args[0] });
	if (!isObj(res) || !isObj(res.data)) return [BOT_RESULT.SERVER_ERROR, { res }];
	if (res.code !== 200 && typeof res.code === 'number') return ['daytool.msg.bili.fail', { input: data.args[0] }];

	return [
		'daytool.msg.bili',
		{
			...res.data,
			time: formatTime(new Date(res.data.time)),
			image: SDK.cq_image(res.data.cover),
		},
	];
})
	.help('daytool.descr.bili')
	.params([
		{
			must: true,
			name: 'bvid',
		},
	]);

Kotori.command('bilier').action( async () => {
	const res = await fetchJ('https://tenapi.cn/bilibili/', { uid: data.args[0] });
	if (!isObj(res) || !isObj(res.data)) return [BOT_RESULT.SERVER_ERROR, { res }];
	if (!res.data.uid || !res.data.name) return ['daytool.msg.bilier.fail', { input: data.args[0] }];
	const res2 = await fetchJ('https://tenapi.cn/bilibilifo/', { uid: data.args[0] });

	return [
		'daytool.msg.bilier',
		{
			...res2.data,
			...res.data,
			image: SDK.cq_image(res.data.avatar),
		},
	];
})
	.help('daytool.descr.bilier')
	.params([
		{
			must: true,
			name: 'uid',
		},
	]);

Kotori.command('bgm').action( async () => {
	const num = parseInt(data.args[1], 10);
	const cache = `bgm${data.args[0]}`;
	const res = Cache.get(cache) || (await fetchBGM(`search/subject/${data.args[0]}`));
	if (!res || !Array.isArray(res.list)) return ['daytool.msg.bgm.fail', { input: data.args[0] }];
	Cache.set(cache, res);

	if (num === 0) {
		let list = '';
		for (let init = 0; init < (res.list.length > maxList ? maxList : res.list.length); init += 1) {
			const data = res.list[init];
			list += temp('daytool.msg.bgm.list', {
				...data,
				num: init + 1,
			});
		}
		return ['daytool.msg.bgm.lists', { list }];
	}

	const data = res.list[num - 1];
	if (!data) return BOT_RESULT.NUM_ERROR;

	const res2 = await fetchBGM(`v0/subjects/${data.id}`);
	if (!res2.name) return ['daytool.msg.bgm.fail', { input: data.args[0] }];

	let tags = '';
	if (Array.isArray(res2.tags)) {
		res2.tags.forEach((data: { name: string; count: number }) => {
			tags += `、${data.name}`;
		});
	}
	return [
		'daytool.msg.bgm',
		{
			...res2,
			tags: tags.substring(1),
			url: `https://bgm.tv/subject/${data.id}`,
			image:
				isObj(res2.images) && typeof res2.images.large === 'string'
					? SDK.cq_image(res2.images.large)
					: BOT_RESULT.EMPTY,
		},
	];
})
	.help('daytool.descr.bgm')
	.params([
		{
			must: true,
			name: 'content',
		},
		{
			must: '1',
			name: 'num',
		},
	]);

Kotori.command('bgmc').action( async () => {
	const res = await fetchBGM(`calendar`);
	if (!Array.isArray(res)) return [BOT_RESULT.SERVER_ERROR, { res }];

	let dayNum = new Date().getDay();
	dayNum = dayNum === 0 ? 6 : dayNum - 1;
	const { items } = res[dayNum];
	if (!Array.isArray(items)) return [BOT_RESULT.SERVER_ERROR, { res: items }];
	let list = '';
	for (let init = 0; init < 3; init += 1) {
		const item = items[init];
		if (!isObj(item)) return [BOT_RESULT.SERVER_ERROR, { res: item }];
		list += temp('daytool.msg.bgmc.list', {
			...item,
			image:
				isObj(item.images) && typeof item.images.large === 'string'
					? SDK.cq_image(item.images.large)
					: BOT_RESULT.EMPTY,
		});
	}
	return [
		'daytool.msg.bgmc',
		{
			weekday: isObj(res[dayNum].weekday) ? ((res[dayNum].weekday as obj).ja as string) : BOT_RESULT.EMPTY,
			list,
		},
	];
}).help('daytool.descr.bgmc');

Kotori.command('star').action( async () => {
	const res = await fetchJ('starluck', { msg: data.args[0] });
	if (!isObj(res)) return [BOT_RESULT.SERVER_ERROR, { res }];
	if (res.code === 501 || !isObj(res.data)) return ['daytool.msg.star.fail', { input: data.args[0] }];

	if (!Array.isArray(res.data.info) || !Array.isArray(res.data.index))
		return [BOT_RESULT.SERVER_ERROR, { res: res.data }];

	let list = '';
	res.data.info.forEach((content: string) => {
		list += temp('daytool.msg.star.list', {
			content,
		});
	});
	res.data.index.forEach((content: string) => {
		list += temp('daytool.msg.star.list', {
			content,
		});
	});
	return [
		'daytool.msg.star',
		{
			input: data.args[0],
			list,
		},
	];
})
	.help('daytool.descr.star')
	.params([
		{
			must: true,
			name: 'starName',
		},
	]);

Kotori.command('tran').action( async () => {
	const res = await fetchJ('fanyi', { msg: data.args[0] });
	const result = res && res.code === 500 && typeof res.data === 'string';
	return [
		result ? 'daytool.msg.tran' : BOT_RESULT.SERVER_ERROR,
		result ? { input: data.args[0], content: res.data } : { res },
	];
})
	.help('daytool.descr.tran')
	.params([
		{
			must: true,
			name: 'content',
			rest: true,
		},
	]);

Kotori.command('lunar').action( async () => {
	const res = await fetchT('lunar');
	return [res ? 'daytool.msg.lunar' : BOT_RESULT.SERVER_ERROR, res ? { content: res } : { res }];
}).help('daytool.descr.lunar');

Kotori.command('story').action( async () => {
	const res = await fetchJ('storytoday');
	if (!res || res.code !== 500 || !Array.isArray(res.data)) return [BOT_RESULT.SERVER_ERROR, res];

	let list = '';
	(res.data as string[]).forEach(content => {
		list += temp('daytool.msg.story.list', {
			content,
		});
	});
	return ['daytool.msg.story', { list }];
}).help('daytool.descr.story');

Kotori.command('luck').action( async (_send, data) => {
	const target = getQq(data.args[0]) || data.user_id;
	fetchT(
		'https://m.smxs.com/qq',
		{},
		{
			headers: {
				'content-type': 'application/x-www-form-urlencoded',
			},
			body: `submit=1&qq=${target}`,
			method: 'POST',
		},
	)
		.then(body => {
			if (!body) return [BOT_RESULT.SERVER_ERROR, { res: body }];
			const $ = cheerio.load(body);
			let luck = $('.subs_main font').text() ?? '';
			luck = luck ? `${luck.split('(')[0]} ${luck.split(')')[1] || ''}` : '';
			const character = $('.subs_main').find('p:eq(4)').text().split('：')[1] ?? '';
			const characterScore = $('.subs_main').find('p:eq(5)').text().split('：')[1] ?? '';
			return [
				'daytool.msg.luck',
				{
					input: target,
					luck,
					character,
					character_score: characterScore,
				},
			];
		})
		.catch(err => [BOT_RESULT.SERVER_ERROR, { res: err }]);
})
	.help('daytool.descr.luck')
	.params([
		{
			must: false,
			name: 'qq/at',
		},
	]);

Kotori.command('value').action( async (send, data) => {
	const target = getQq(data.args[0]) || data.user_id;
	send('daytool.msg.value', {
		image: SDK.cq_image(`https://c.bmcx.com/temp/qqjiazhi/${target}.jpg`),
	});
})
	.help('daytool.descr.value')
	.params([
		{
			must: false,
			name: 'qq/at',
		},
	]);

Kotori.command('weather').action( async () => {
	const res = await fetchT('weather', { msg: data.args[0], b: 1 });
	return [res ? 'daytool.msg.weather' : BOT_RESULT.SERVER_ERROR, res ? { content: res } : { res }];
})
	.help('daytool.descr.weather')
	.params([
		{
			must: true,
			name: 'area',
		},
	]);

Kotori.command('waste').action( async () => {
	const res = await fetchJ(
		'https://api.toolnb.com/Tools/Api/lajifenlei.html',
		{},
		{
			headers: {
				'content-type': 'application/x-www-form-urlencoded',
			},
			body: `input=${data.args[0]}`,
			method: 'POST',
		},
	);
	if (!res) return BOT_RESULT.REPAIRING;
	if (!res || !Array.isArray(res.data) || !isObj(res.data[0])) return [BOT_RESULT.SERVER_ERROR, { res }];
	const list = [
		Locale.locale('daytool.msg.waste.key.0'),
		Locale.locale('daytool.msg.waste.key.1'),
		Locale.locale('daytool.msg.waste.key.2'),
		Locale.locale('daytool.msg.waste.key.3'),
		Locale.locale('daytool.msg.waste.key.4'),
		Locale.locale('daytool.msg.waste.key.5'),
	];
	const type = list[res.data[0].type === 'string' ? parseInt(res.data[0].type, 10) : 0];
	return [
		'daytool.msg.waste',
		{
			input: data.args[0],
			type,
		},
	];
})
	.help('daytool.descr.waste')
	.params([
		{
			must: true,
			name: 'item',
		},
	]);
