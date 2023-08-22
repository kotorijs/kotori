import path from 'path';
import { Cache, Core, fetchT, getQq, temp } from 'plugins/kotori-core';
import { fetchJ } from 'plugins/kotori-core/method';
import { BOT_RESULT, CoreVal } from 'plugins/kotori-core/type';
import cheerio from 'cheerio';
import { Locale, isObj, obj } from '@/tools';
import SDK from '@/utils/class.sdk';
import { fetchBGM } from './method';
import config from './config';

const { maxList } = config;

Locale.register(path.resolve(__dirname));

const Cmd = (keyword: string, callback: CoreVal) => {
	const result = Core.cmd(keyword, callback).menuId('dayTool');
	return result;
};

Cmd('music', async send => {
	const cache = `music${Core.args[1]}`;
	const res = Cache.get(cache) || (await fetchJ('netease', { name: Core.args[1] }));
	if (!isObj(res)) return [BOT_RESULT.SERVER_ERROR, { res }];
	Cache.set(cache, res);
	if (res.code !== 500 || !Array.isArray(res.data)) return ['daytool.cmd.music.fail', { input: Core.args[1] }];

	const num = parseInt(Core.args[2], 10);
	if (num === 0) {
		let list = '';
		for (let init = 0; init < (res.data.length > maxList ? maxList : res.data.length); init += 1) {
			const song = res.data[init];
			list += temp('daytool.cmd.music.list', {
				num: init + 1,
				title: typeof song.title === 'string' ? song.title : BOT_RESULT.EMPTY,
				author: typeof song.author === 'string' ? song.author : BOT_RESULT.EMPTY,
			});
		}
		return ['daytool.cmd.music.lists', { list }];
	}

	const song = res.data[num - 1];
	if (!song) return BOT_RESULT.NUM_ERROR;

	send(SDK.cq_Music('163', song.songid));

	return [
		'daytool.cmd.music.info',
		{
			...song,
			image: typeof song.pic === 'string' ? SDK.cq_image(song.pic) : BOT_RESULT.EMPTY,
		},
	];
})
	.descr('daytool.cmd.music.descr')
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

Cmd('bili', async () => {
	const res = await fetchJ('biligetv', { msg: Core.args[1] });
	if (!isObj(res) || !isObj(res.data)) return [BOT_RESULT.SERVER_ERROR, { res }];
	if (res.code !== 500 && typeof res.code === 'number') return ['daytool.cmd.bili.fail', { input: Core.args[1] }];

	return [
		'daytool.cmd.bili.info',
		{
			...res.data,
			owner: res.data.owner.uid,
			image: SDK.cq_image(res.data.pic),
		},
	];
})
	.descr('daytool.cmd.bili.descr')
	.params([
		{
			must: true,
			name: 'bvid',
		},
	]);

Cmd('bgm', async () => {
	const num = parseInt(Core.args[2], 10);
	const cache = `bgm${Core.args[1]}`;
	const res = Cache.get(cache) || (await fetchBGM(`search/subject/${Core.args[1]}`));
	if (!res || !Array.isArray(res.list)) return ['daytool.cmd.bgm.fail', { input: Core.args[1] }];
	Cache.set(cache, res);

	if (num === 0) {
		let list = '';
		for (let init = 0; init < (res.list.length > maxList ? maxList : res.list.length); init += 1) {
			const data = res.list[init];
			list += temp('daytool.cmd.bgm.list', {
				...data,
				num: init + 1,
			});
		}
		return ['daytool.cmd.bgm.lists', { list }];
	}

	const data = res.list[num - 1];
	if (!data) return BOT_RESULT.NUM_ERROR;

	const res2 = await fetchBGM(`v0/subjects/${data.id}`);
	if (!res2.name) return ['daytool.cmd.bgm.fail', { input: Core.args[1] }];

	let tags = '';
	if (Array.isArray(res2.tags)) {
		res2.tags.forEach((data: { name: string; count: number }) => {
			tags += `、${data.name}`;
		});
	}
	return [
		'daytool.cmd.bgm.info',
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
	.descr('daytool.cmd.bgm.descr')
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

Cmd('bgmc', async () => {
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
		list += temp('daytool.cmd.bgmc.list', {
			...item,
			image:
				isObj(item.images) && typeof item.images.large === 'string'
					? SDK.cq_image(item.images.large)
					: BOT_RESULT.EMPTY,
		});
	}
	return [
		'daytool.cmd.bgmc.info',
		{
			weekday: isObj(res[dayNum].weekday) ? ((res[dayNum].weekday as obj).ja as string) : BOT_RESULT.EMPTY,
			list,
		},
	];
}).descr('daytool.cmd.bgmc.descr');

Cmd('star', async () => {
	const res = await fetchJ('starluck', { msg: Core.args[1] });
	if (!isObj(res)) return [BOT_RESULT.SERVER_ERROR, { res }];
	if (res.code === 501 || !isObj(res.data)) return ['daytool.cmd.star.fail', { input: Core.args[1] }];

	if (!Array.isArray(res.data.info) || !Array.isArray(res.data.index))
		return [BOT_RESULT.SERVER_ERROR, { res: res.data }];

	let list = '';
	res.data.info.forEach((content: string) => {
		list += temp('daytool.cmd.star.list', {
			content,
		});
	});
	res.data.index.forEach((content: string) => {
		list += temp('daytool.cmd.star.list', {
			content,
		});
	});
	return [
		'daytool.cmd.star.info',
		{
			input: Core.args[1],
			list,
		},
	];
})
	.descr('daytool.cmd.star.descr')
	.params([
		{
			must: true,
			name: 'starName',
		},
	]);

Cmd('tran', async () => {
	const res = await fetchJ('fanyi', { msg: Core.args[1] });
	const result = res && res.code === 500 && typeof res.data === 'string';
	return [
		result ? 'daytool.cmd.tran.info' : BOT_RESULT.SERVER_ERROR,
		result ? { input: Core.args[1], content: res.data } : { res },
	];
})
	.descr('daytool.cmd.tran.descr')
	.params([
		{
			must: true,
			name: 'content',
			rest: true,
		},
	]);

Cmd('lunar', async () => {
	const res = await fetchT('lunar');
	return [res ? 'daytool.cmd.lunar.info' : BOT_RESULT.SERVER_ERROR, res ? { content: res } : { res }];
}).descr('daytool.cmd.lunar.descr');

Cmd('story', async () => {
	const res = await fetchJ('storytoday');
	if (!res || res.code !== 500 || !Array.isArray(res.data)) return [BOT_RESULT.SERVER_ERROR, res];

	let list = '';
	(res.data as string[]).forEach(content => {
		list += temp('daytool.cmd.story.list', {
			content,
		});
	});
	return ['daytool.cmd.story.info', { list }];
}).descr('daytool.cmd.story.descr');

Cmd('luck', async (_send, data) => {
	const target = getQq(Core.args[1]) || data.user_id;
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
				'daytool.cmd.luck.info',
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
	.descr('daytool.cmd.luck.descr')
	.params([
		{
			must: false,
			name: 'qq/at',
		},
	]);

Cmd('value', async (send, data) => {
	const target = getQq(Core.args[1]) || data.user_id;
	send('daytool.cmd.value.info', {
		image: SDK.cq_image(`https://c.bmcx.com/temp/qqjiazhi/${target}.jpg`),
	});
})
	.descr('daytool.cmd.value.descr')
	.params([
		{
			must: false,
			name: 'qq/at',
		},
	]);

Cmd('weather', async () => {
	const res = await fetchT('weather', { msg: Core.args[1], b: 1 });
	return [res ? 'daytool.cmd.weather.info' : BOT_RESULT.SERVER_ERROR, res ? { content: res } : { res }];
})
	.descr('daytool.cmd.weather.descr')
	.params([
		{
			must: true,
			name: 'area',
		},
	]);

Cmd('waste', async () => {
	const res = await fetchJ(
		'https://api.toolnb.com/Tools/Api/lajifenlei.html',
		{},
		{
			headers: {
				'content-type': 'application/x-www-form-urlencoded',
			},
			body: `input=${Core.args[1]}`,
			method: 'POST',
		},
	);
	if (!res) return BOT_RESULT.REPAIRING;
	if (!res || !Array.isArray(res.data) || !isObj(res.data[0])) return [BOT_RESULT.SERVER_ERROR, { res }];
	const list = [
		Locale.locale('daytool.cmd.waste.key.0'),
		Locale.locale('daytool.cmd.waste.key.1'),
		Locale.locale('daytool.cmd.waste.key.2'),
		Locale.locale('daytool.cmd.waste.key.3'),
		Locale.locale('daytool.cmd.waste.key.4'),
		Locale.locale('daytool.cmd.waste.key.5'),
	];
	const type = list[res.data[0].type === 'string' ? parseInt(res.data[0].type, 10) : 0];
	return [
		'daytool.cmd.waste.info',
		{
			input: Core.args[1],
			type,
		},
	];
})
	.descr('daytool.cmd.waste.descr')
	.params([
		{
			must: true,
			name: 'item',
		},
	]);
