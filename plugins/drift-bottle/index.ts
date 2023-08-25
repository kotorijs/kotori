import path from 'path';
import { Core } from 'plugins/kotori-core';
import { SCOPE } from 'plugins/kotori-core/type';
import { Const, Locale, loadConfig, getRandomInt, saveConfig, formatTime } from '@/tools';
import SDK from '@/utils/class.sdk';
import config from './config';

Locale.register(path.resolve(__dirname));

const getPath = () => {
	const result = path.join(Main.Consts.DATA_PLUGIN_PATH, 'data.json');
	return result;
};

const getBottle = () => {
	const data = loadConfig(getPath(), 'json', []) as [string, number, number, number?][];
	return data;
};

const getZero = () => {
	const now = new Date();
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	today.setHours(0);
	today.setMinutes(0);
	today.setSeconds(0);
	today.setMilliseconds(0);
	return today.getTime();
};

Core.cmd('throw', (_send, eventData) => {
	const at = SDK.cq_at(eventData.user_id);
	if (!Core.args[1]) return ['drift_bottle.cmd.throw.empty', { at }];

	const data = getBottle();
	const zero = getZero();
	let num = 0;

	data.forEach(Element => {
		if (Element[3] !== eventData.user_id) return;
		if (Element[2] < zero) return;
		num += 1;
	});
	if (num > config.maxNum) return ['drift_bottle.cmd.throw.fail', { num: config.maxNum, at }];
	data.push([Core.args[1], new Date().getTime(), eventData.group_id!, eventData.user_id]);
	saveConfig(getPath(), data);
	return ['drift_bottle.cmd.throw.info', { at }];
})
	.descr('drift_bottle.cmd.throw.descr')
	.menuId('funSys')
	.scope(SCOPE.GROUP)
	.params([
		{
			must: false,
			rest: true,
		},
	]);

Core.cmd('pick', () => {
	const data = getBottle();
	if (!data || data.length < 0) return 'drift_bottle.cmd.pick.none';
	const bottle = data[getRandomInt(data.length - 1)];
	return [
		'drift_bottle.cmd.pick.info',
		{
			message: bottle[0],
			time: formatTime(new Date(bottle[1])),
			group: bottle[2],
		},
	];
})
	.descr('drift_bottle.cmd.pick.descr')
	.menuId('funSys')
	.scope(SCOPE.GROUP);

export class Main {
	public static Consts: Const;

	public constructor(_event: unknown, _api: unknown, consts: Const) {
		Main.Consts = consts;
	}
}
export default Main;
