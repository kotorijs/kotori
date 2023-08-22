/*
 * @Author: Hotaru biyuehuya@gmail.com
 * @Blog: http://imlolicon.tk
 * @Date: 2023-07-30 11:33:15
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2023-08-21 17:11:10
 */
import path from 'path';
import { Core, temp } from 'plugins/kotori-core';
import { Api, Const, Locale, loadConfig, saveConfig } from '@/tools';
import SDK from '@/utils/class.sdk';
import config from './config';
import { arrData } from './type';

Locale.register(path.resolve(__dirname));

export default (_Event: Event, _Api: Api, Consts: Const) => {
	CONST = Consts;
};

let CONST: Const;

const getNewLength = () => {
	const { max, min } = config;
	const range = max - min + 1;
	const index = Math.floor(Math.random() * range);
	const result = min + index;
	return result;
};

const getTodayPath = () => {
	const TIME = new Date();
	const time = `${TIME.getFullYear()}-${TIME.getMonth() + 1}-${TIME.getDate()}`;
	return path.join(CONST.DATA_PLUGIN_PATH, `${time}.json`);
};

const loadTodayData = (): number[] => (loadConfig(getTodayPath()) as number[]) || [];

const saveTodayData = (data: number[]) => saveConfig(getTodayPath(), data);

const loadStatData = (): arrData => {
	const PATH = path.join(CONST.DATA_PLUGIN_PATH, `stat.json`);
	return (loadConfig(PATH) as arrData) || [];
};

const saveStatData = (data: arrData) => {
	const PATH = path.join(CONST.DATA_PLUGIN_PATH, `stat.json`);
	saveConfig(PATH, data);
};

Core.alias('今日长度', (send, data) => {
	/* 加载数据 */
	const today = loadTodayData();
	const todayLength = typeof today[data.user_id] === 'number' ? today[data.user_id] : getNewLength();

	/* 发送消息 */
	let message = '';
	const params = {
		at: SDK.cq_at(data.user_id),
		length: todayLength,
	};
	if (todayLength <= 0) message = temp('newnew.cmd.today_length.info.2', params);
	else if (todayLength > 0 && todayLength <= config.joke) message = temp('newnew.cmd.today_length.info.1', params);
	else message = temp('newnew.cmd.today_length.info.0', params);
	send(message);

	/* 如果数据中不存在则更新数据 */
	if (typeof today[data.user_id] === 'number') return;
	today[data.user_id] = todayLength;
	saveTodayData(today);
	/* 更新stat */
	const stat = loadStatData();
	const person = stat[data.user_id];
	if (Array.isArray(person) /* && person.length === 4 */) {
		if (todayLength <= person[0]) person[0] = todayLength;
		if (todayLength >= person[1]) person[1] = todayLength;
		person[2] += 1;
		person[3] += todayLength;
		person[4] = data.sender.nickname;
	} else {
		stat[data.user_id] = [todayLength, todayLength, 1, todayLength, data.sender.nickname];
	}
	saveStatData(stat);
})
	.descr('newnew.cmd.today_length.descr')
	.menuId('funSys');

Core.alias('我的长度', (_send, data) => {
	const stat = loadStatData();
	const person = stat[data.user_id];
	if (!person || person.length <= 0) return ['newnew.cmd.my_length.fail', { at: SDK.cq_at(data.user_id) }];
	return [
		'newnew.cmd.my_length.info',
		{
			at: SDK.cq_at(data.user_id),
			max_length: person[1],
			min_length: person[0],
			total_length: person[3],
			avg_length: (person[3] / person[2]).toFixed(1),
			nums: person[2],
		},
	];
})
	.descr('newnew.cmd.my_length.descr')
	.menuId('funSys');

Core.alias('平均排行', () => {
	const stat = loadStatData();
	const statOrigin = loadStatData();
	if (stat.length <= 0) return 'newnew.cmd.avg_ranking.fail';
	Object.keys(stat).forEach(key => {
		const item = stat[key as unknown as number];
		item[3] /= item[2];
	});
	const entries = Object.entries(stat);
	entries.sort((a, b) => b[1][3] - a[1][3]);

	let list = '';
	let num = 1;
	entries.forEach(entry => {
		const nums = entry[1][2];
		if (nums < config.avgMinNum) return;
		list += temp('newnew.cmd.avg_ranking.list', {
			num,
			name: entry[1][4],
			nums,
			avg_length: entry[1][3].toFixed(1),
			total_length: statOrigin[entry[0] as unknown as number][3],
		});
		num += 1;
	});
	return ['newnew.cmd.avg_ranking.info', { list }];
})
	.descr('newnew.cmd.avg_ranking.descr')
	.menuId('funSys');

Core.alias('今日排行', () => {
	const stat = loadStatData();
	const today = loadTodayData();
	if (today.length <= 0) return 'newnew.cmd.today_ranking.fail';

	const newEntries = Object.entries(today);
	newEntries.sort((a, b) => b[1] - a[1]);

	let list = '';
	let num = 1;
	newEntries.forEach(entry => {
		const data = stat[entry[0] as unknown as number];
		list += temp('newnew.cmd.today_ranking.list', {
			num,
			name: data[4],
			length: entry[1],
		});
		num += 1;
	});
	return ['newnew.cmd.today_ranking.info', { list }];
})
	.descr('newnew.cmd.today_ranking.descr')
	.menuId('funSys');
