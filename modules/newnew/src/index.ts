/*
 * @Author: Hotaru biyuehuya@gmail.com
 * @Blog: https://hotaru.icu
 * @Date: 2023-07-30 11:33:15
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2023-11-18 21:31:27
 */
import path from 'path';
import Kotori, { obj } from 'kotori-bot';
import config from './config';

Kotori.uselang(path.resolve(__dirname, '../locales'));

Kotori.regexp(/^今日长度$/, data => {
	if (!(data.userId in penisData)) {
		penisData[data.userId] = getNewLength();
	}
	const todayLength = penisData[data.userId];
	const params = {
		at: `[CQ:at,qq=${data.userId}]`,
		length: todayLength,
	};
	if (todayLength <= 0) return ['newnew.msg.today_length.info.2', params];
	if (todayLength > 0 && todayLength <= config.joke) return ['newnew.msg.today_length.info.1', params];
	return ['newnew.msg.today_length.info.0', params];

	/* 加载数据 */
	// const today = loadTodayData();
	// const todayLength = typeof today[data.user_id] === 'number' ? today[data.user_id] : getNewLength();

	/* 发送消息 */
	// let message = '';
	// const params = {
	// 	at: SDK.cq_at(data.user_id),
	// 	length: todayLength,
	// };
	// if (todayLength <= 0) message = temp('newnew.msg.today_length.info.2', params);
	// else if (todayLength > 0 && todayLength <= config.joke) message = temp('newnew.msg.today_length.info.1', params);
	// else message = temp('newnew.msg.today_length.info.0', params);
	// send(message);

	// /* 如果数据中不存在则更新数据 */
	// if (typeof today[data.user_id] === 'number') return;
	// const result = parseInt((((todayLength + 20) / 10) * 2).toFixed(), 10);
	// addExp(data.group_id!, data.user_id, result < 0 ? 0 : result);
	// today[data.user_id] = todayLength;
	// saveTodayData(today);
	// /* 更新stat */
	// const stat = loadStatData();
	// const person = stat[data.user_id];
	// if (Array.isArray(person) /* && person.length === 4 */) {
	// 	if (todayLength <= person[0]) person[0] = todayLength;
	// 	if (todayLength >= person[1]) person[1] = todayLength;
	// 	person[2] += 1;
	// 	person[3] += todayLength;
	// } else {
	// 	stat[data.user_id] = [todayLength, todayLength, 1, todayLength];
	// }
	// saveStatData(stat);
});

Kotori.regexp(/^我的长度$/, () => {
	const result = '该功能维护中';
	return result;
	/* 	const stat = loadStatData();
	const person = stat[data.user_id];
	if (!person || person.length <= 0) return ['newnew.msg.my_length.fail', { at: SDK.cq_at(data.user_id) }];
	return [
		'newnew.msg.my_length',
		{
			at: SDK.cq_at(data.user_id),
			max_length: person[1],
			min_length: person[0],
			total_length: person[3],
			avg_length: (person[3] / person[2]).toFixed(1),
			nums: person[2],
		},
	]; */
});

Kotori.regexp(/^平均排行$/, () => {
	const result = '该功能维护中';
	return result;
	/* 	const stat = loadStatData();
	const statOrigin = loadStatData();
	if (stat.length <= 0) return 'newnew.msg.avg_ranking.fail';
	Object.keys(stat).forEach(key => {
		const item = stat[key as unknown as number];
		item[3] /= item[2];
	});
	const entries = Object.entries(stat);
	entries.sort((a, b) => b[1][3] - a[1][3]);

	let list = '';
	let num = 1;
	entries.forEach(entry => {
		if (num > 20) return;
		const nums = entry[1][2];
		if (nums < config.avgMinNum) return;
		list += temp('newnew.msg.avg_ranking.list', {
			num,
			name: queryUserInfo(parseInt(entry[0], 10)).nickname,
			nums,
			avg_length: entry[1][3].toFixed(1),
			total_length: statOrigin[entry[0] as unknown as number][3],
		});
		num += 1;
	});
	return ['newnew.msg.avg_ranking', { list }]; */
});

Kotori.regexp(/^今日排行$/, () => {
	const result = '该功能维护中';
	return result;
	/* const today = loadTodayData();
	if (today.length <= 0) return 'newnew.msg.today_ranking.fail';

	const newEntries = Object.entries(today);
	newEntries.sort((a, b) => b[1] - a[1]);

	let list = '';
	let num = 1;
	newEntries.forEach(entry => {
		if (num > 20) return;
		list += temp('newnew.msg.today_ranking.list', {
			num,
			name: queryUserInfo(parseInt(entry[0], 10)).nickname,
			length: entry[1],
		});
		num += 1;
	});
	return ['newnew.msg.today_ranking', { list }]; */
});

const penisData: obj<number> = {};
/* 
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
}; */

const getNewLength = () => {
	const { max, min } = config;
	const range = max - min + 1;
	const index = Math.floor(Math.random() * range);
	const result = min + index;
	return result;
};

// type arrData = [number, number, number, number][];
