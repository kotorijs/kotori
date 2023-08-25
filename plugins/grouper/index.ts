import path from 'path';
import { Core } from 'plugins/kotori-core';
import { SCOPE } from 'plugins/kotori-core/type';
import { Event, Api, Const, Locale, loadConfig, saveConfig, obj, getRandomInt, getDate } from '@/tools';
import SDK from '@/utils/class.sdk';
import Profile from './class/class.profile';

Locale.register(path.resolve(__dirname));

interface userData {
	sign: string[];
	msg: number;
	exp: number;
}

const defaultData = {
	sign: [],
	msg: 0,
	exp: 0,
};

const getPath = (group: number) => path.join(Main.Consts.DATA_PLUGIN_PATH, `${group.toString()}.json`);

const loadData = (group: number): obj<userData> => {
	const data = (loadConfig(getPath(group), 'json', { group: defaultData }) as obj) || {};
	return data;
};

const saveData = (data: object, group: number) => {
	saveConfig(getPath(group), data);
};

export const queryUser = (group: number, user: number): [userData, obj<userData>] => {
	const data = loadData(group);
	if (!(user in data)) {
		data[user as keyof typeof data] = defaultData;
		saveData(data, group);
	}
	return [data[user as keyof typeof data], data];
};

export const addExp = (group: number, user: number, exp: number, tips: boolean = true) => {
	if (exp === 0) return;
	const data = loadData(group);

	if (!(user in data)) data[user as keyof typeof data] = defaultData;
	data.group.exp += exp;
	data[user as keyof typeof data].exp += exp;
	saveData(data, group);
	if (tips) Main.Api.send_group_msg(`${SDK.cq_at(user)}经验+${exp}`, group);
};

Core.alias('资料卡', async (_send, data) => {
	const userData = queryUser(data.group_id!, data.user_id)[0];
	const image = new Profile(data, parseInt(Core.args[1], 10) || userData.exp).render();
	return SDK.cq_image((await image).replace('data:image/png;base64,', 'base64://'));
})
	.menuId('funSys')
	.scope(SCOPE.GROUP);

Core.alias(['签到', '打卡'], (_send, data) => {
	const time = getDate();
	const groupData = queryUser(data.group_id!, data.user_id)[1];
	const at = SDK.cq_at(data.user_id);
	if (!(data.user_id in groupData)) groupData[data.user_id] = defaultData;
	if (groupData[data.user_id].sign.includes(time)) return ['%at% 今天已经签过到了，明天再来试吧', { at }];
	groupData[data.user_id].sign.push(time);
	saveData(groupData, data.group_id!);
	addExp(data.group_id!, data.user_id, getRandomInt(20, 10));
	return [
		'%at% 签到成功！奖励已发放~%image%',
		{ at, image: SDK.cq_image('https://tenapi.cn/acg', undefined, undefined, 'normal', 0) },
	];
})
	.menuId('funSys')
	.scope(SCOPE.GROUP);

Core.hook(data => {
	if (!data.group_id) return true;
	const groupData = queryUser(data.group_id, data.user_id)[1];
	if (!(data.user_id in groupData)) groupData[data.user_id] = defaultData;
	groupData[data.user_id].msg += 1;
	groupData.group.msg += 1;
	saveData(groupData, data.group_id);
	if (data.message.toUpperCase().includes('CQ')) return true;
	if (data.message.length <= 100) addExp(data.group_id, data.user_id, Math.floor(data.message.length / 10), false);
	if (data.message.length > 100) addExp(data.group_id, data.user_id, Math.floor(data.message.length / 20), false);
	return true;
});

export class Main {
	public static Consts: Const;

	public static Api: Api;

	public constructor(event: Event, api: Api, consts: Const) {
		Main.Consts = consts;
		Main.Api = api;
		event.listen('on_group_msg', data => console.log(data.sender));
	}
}

export default Main;
