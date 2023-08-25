import path from 'path';
import { Core } from 'plugins/kotori-core';
import { SCOPE } from 'plugins/kotori-core/type';
import { addExp } from 'plugins/grouper';
import { Const, Locale, loadConfig, saveConfig } from '@/tools';
import SDK from '@/utils/class.sdk';
import good from './type';
import { formatTime, getSex } from './method';
import config from './config';

Locale.register(path.resolve(__dirname));

const getTodayPath = (yesterday: boolean = false) => {
	const TIME = new Date();
	const date = TIME.getDate();
	const time = `${TIME.getFullYear()}-${TIME.getMonth() + 1}-${yesterday ? date - 1 : date}`;
	return path.join(Main.Consts.DATA_PLUGIN_PATH, `${time}.json`);
};

const defaultData: good = { morning: {}, night: {} };

const loadTodayData = (yesterday: boolean = false) =>
	(loadConfig(getTodayPath(yesterday), 'json', defaultData) as good) || defaultData;

const saveTodayData = (data: good) => saveConfig(getTodayPath(), data);

Core.alias(['早', '早安', '早上好'], (_send, data) => {
	const record = loadTodayData();
	const at = SDK.cq_at(data.user_id);
	if (data.user_id in record.morning) return ['goodnight.cmd.morning.already', { at }];

	const hours = new Date().getHours();
	if (hours < config.getupTimeLess) return ['goodnight.cmd.morning.early', { at, hour: config.getupTimeLess }];

	record.morning[data.user_id] = new Date().getTime();
	saveTodayData(record);
	const count = Object.keys(record.morning).length;
	if (count <= 10) addExp(data.group_id!, data.user_id, 15);
	if (count > 10 && count <= 20) addExp(data.group_id!, data.user_id, 5);
	const sex = getSex(data.sender.sex);
	if (hours < 12) return ['goodnight.cmd.morning.morning', { at, count, sex }];
	if (hours >= 12 && hours < config.getupTimeLate) return ['goodnight.cmd.morning.afternoon', { at, count, sex }];
	return ['goodnight.cmd.morning.late', { at, count, sex }];
})
	.menuId('funSys')
	.scope(SCOPE.GROUP);

Core.alias(['晚', '晚安', '晚上好'], (_send, data) => {
	const record = loadTodayData();
	const at = SDK.cq_at(data.user_id);
	if (data.user_id in record.night) return ['goodnight.cmd.night.already', { at }];

	const record2 = loadTodayData(true);
	if (!(data.user_id in record.morning) && !(data.user_id in record2.morning))
		return ['goodnight.cmd.night.not', { at }];

	const nowTime = new Date().getTime();
	const timecal = nowTime - (record.morning[data.user_id] || record2.morning[data.user_id]);
	if (timecal < config.sleepTimeLess * 60 * 60 * 1000) return ['goodnight.cmd.night.less', { at }];

	record.night[data.user_id] = nowTime;
	saveTodayData(record);
	const time = formatTime(timecal);
	const hours = new Date().getHours();
	const { sleepTimeLater: later, sleepTimeLate: late, sleepTimeNormal: normal } = config;
	if (hours >= later[0] && hours < later[1]) return ['goodnight.cmd.night.later', { at, time }];
	if (hours >= late[0] || hours < late[1]) return ['goodnight.cmd.night.late', { at, time }];
	if (hours >= normal[0] && hours < normal[1]) return ['goodnight.cmd.night.normal', { at, time }];
	return ['goodnight.cmd.night.early', { at, time }];
})
	.menuId('funSys')
	.scope(SCOPE.GROUP);

export class Main {
	public static Consts: Const;

	public constructor(_event: unknown, _api: unknown, consts: Const) {
		Main.Consts = consts;
	}
}
export default Main;
