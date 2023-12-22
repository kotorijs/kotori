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

Kotori.command('star')
	.action(async () => {
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

Kotori.command('tran')
	.action(async () => {
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

Kotori.command('lunar')
	.action(async () => {
		const res = await fetchT('lunar');
		return [res ? 'daytool.msg.lunar' : BOT_RESULT.SERVER_ERROR, res ? { content: res } : { res }];
	})
	.help('daytool.descr.lunar');

Kotori.command('story')
	.action(async () => {
		const res = await fetchJ('storytoday');
		if (!res || res.code !== 500 || !Array.isArray(res.data)) return [BOT_RESULT.SERVER_ERROR, res];

		let list = '';
		(res.data as string[]).forEach(content => {
			list += temp('daytool.msg.story.list', {
				content,
			});
		});
		return ['daytool.msg.story', { list }];
	})
	.help('daytool.descr.story');
