import { resolve } from 'path';
import Kotori, { isObj, obj, stringTemp } from '@kotori-bot/kotori';
import http from './http';

const image = (file: string, cache: boolean = false) => `[CQ:image,file=${file}],cache=${cache ? 1 : 0}`;

const MAX_LIST = 10;

Kotori.uselang(resolve(__dirname, '../locales'));

Kotori.command('bgm <content> [order:number=1] - bangumi.descr.bgm').action(async (data, events) => {
	// const cache = `bgm${data.args[0]}`;
	const res = /* Cache.get(cache) || */ await http(`search/subject/${data.args[0]}`);
	if (!res || !Array.isArray(res.list)) return ['bangumi.msg.bgm.fail', { input: data.args[0] }];
	// Cache.set(cache, res);

	if (data.args[1] === 0) {
		let list = '';
		for (let init = 0; init < (res.list.length > MAX_LIST ? MAX_LIST : res.list.length); init += 1) {
			const result = res.list[init];
			list += stringTemp(events.locale('bangumi.msg.bgm.list'), {
				...result,
				num: init + 1,
			});
		}
		return ['bangumi.msg.bgm.lists', { list }];
	}

	const result = res.list[(data.args[1] as number) - 1];
	if (!result) return 'BOT_RESULT.NUM_ERROR';

	const res2 = await http(`v0/subjects/${result.id}`);
	if (!res2.name) return ['bangumi.msg.bgm.fail', { input: data.args[0] }];

	let tags = '';
	if (Array.isArray(res2.tags)) {
		res2.tags.forEach((result: { name: string; count: number }) => {
			tags += `、${result.name}`;
		});
	}
	return [
		'bangumi.msg.bgm',
		{
			...res2,
			tags: tags.substring(1),
			url: `https://bgm.tv/subject/${result.id}`,
			image:
				isObj(res2.images) && typeof res2.images.large === 'string'
					? image(res2.images.large)
					: 'BOT_RESULT.EMPTY',
		},
	];
});

Kotori.command('bgmc - bangumi.descr.bgmc').action(async (_, events) => {
	const res = await http(`calendar`);
	if (!Array.isArray(res)) return ['BOT_RESULT.SERVER_ERROR', { res }];

	let dayNum = new Date().getDay();
	dayNum = dayNum === 0 ? 6 : dayNum - 1;
	const { items } = res[dayNum];
	if (!Array.isArray(items)) return ['BOT_RESULT.SERVER_ERROR', { res: items }];
	let list = '';
	for (let init = 0; init < 3; init += 1) {
		const item = items[init];
		if (!isObj(item)) return ['BOT_RESULT.SERVER_ERROR', { res: item }];
		list += stringTemp(events.locale('bangumi.msg.bgmc.list'), {
			...item,
			image:
				isObj(item.images) && typeof item.images.large === 'string'
					? image(item.images.large)
					: 'BOT_RESULT.EMPTY',
		});
	}
	return [
		'bangumi.msg.bgmc',
		{
			weekday: isObj(res[dayNum].weekday) ? ((res[dayNum].weekday as obj).ja as string) : 'BOT_RESULT.EMPTY',
			list,
		},
	];
});
