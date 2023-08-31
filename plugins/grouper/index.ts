import path from 'path';
import { readdirSync } from 'fs';
import { Core, temp } from 'plugins/kotori-core';
import { CoreKeyword, CoreVal, SCOPE } from 'plugins/kotori-core/type';
import { Event, Api, Const, Locale, loadConfig, saveConfig, obj, getRandomInt, getDate, isObj } from '@/tools';
import SDK from '@/utils/class.sdk';
import Profile from './class/class.profile';
import Guess from './class/class.guess';
import { userData } from './type';
import Hand from './class/class.hand';

Locale.register(path.resolve(__dirname));

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

export const queryUser = (group: number, user: number, userName?: string): [userData, obj<userData>] => {
	const data = loadData(group);
	if (!(user in data)) {
		data[user as keyof typeof data] = defaultData;
	}

	if (userName) data[user as keyof typeof data].name = userName;
	saveData(data, group);
	return [data[user as keyof typeof data], data];
};

export const addExp = (group: number, user: number, exp: number, userName?: string, tips: boolean = true) => {
	if (exp === 0) return;
	const data = loadData(group);

	if (!(user in data)) data[user as keyof typeof data] = defaultData;
	data.group.exp += exp;
	data[user as keyof typeof data].exp += exp;
	if (userName) data[user as keyof typeof data].name = userName;
	saveData(data, group);
	if (tips) Main.Api.send_group_msg(`${SDK.cq_at(user)}经验+${exp}`, group);
};

const Alias = (keyword: CoreKeyword, callback: CoreVal) => {
	const entity = Core.alias(keyword, callback).menuId('funSys').scope(SCOPE.GROUP);
	return entity;
};

Alias('资料卡', async (_send, data) => {
	const userData = queryUser(data.group_id!, data.user_id, data.sender.nickname)[0];
	const image = new Profile(data, parseInt(Core.args[1], 10) || userData.exp).render();
	return SDK.cq_image((await image).replace('data:image/png;base64,', 'base64://'));
});

Alias(['签到', '打卡'], (_send, data) => {
	const time = getDate();
	const groupData = queryUser(data.group_id!, data.user_id, data.sender.nickname)[1];
	const at = SDK.cq_at(data.user_id);
	if (!(data.user_id in groupData)) groupData[data.user_id] = defaultData;
	if (groupData[data.user_id].sign.includes(time)) return ['%at%今天已经签过到了，明天再来试吧', { at }];
	groupData[data.user_id].sign.push(time);
	saveData(groupData, data.group_id!);
	addExp(data.group_id!, data.user_id, getRandomInt(20, 10));
	return [
		'%at%签到成功！奖励已发放~%image%',
		{ at, image: SDK.cq_image('https://tenapi.cn/acg', undefined, undefined, 'normal', 0) },
	];
});

Alias('群排行', () => {
	const files = readdirSync(Main.Consts.DATA_PLUGIN_PATH);
	const groupData: userData[] = [];
	files.forEach(filename => {
		if (!filename.includes('.json')) return;
		const result = loadConfig(path.join(Main.Consts.DATA_PLUGIN_PATH, filename)) as object;
		if (!isObj(result) || !result.group || typeof result.group.exp !== 'number') return;
		groupData.push({
			...result.group,
			name: filename.split('.')[0],
		});
	});

	groupData.sort((a, b) => b.exp - a.exp);

	let rank = 1;
	let list = '';
	groupData.forEach(oldItem => {
		if (rank > 20) return;
		const item = oldItem as obj;
		item.sign = '';
		list += temp('\n%rank%.群:%name% - 经验: %exp% (发言: %msg%次)', { rank, ...item });
		rank += 1;
	});
	return ['群排行:%list%', { list }];
});

Alias('等级排行', (_send, data) => {
	const result = loadData(data.group_id!);
	const arr: userData[] = [];
	Object.keys(result).forEach(Element => {
		if (Element === 'group') return;
		arr.push(result[Element]);
	});

	arr.sort((a, b) => b.exp - a.exp);

	let rank = 1;
	let list = '';
	arr.forEach(oldItem => {
		if (rank > 20) return;
		const item = oldItem as obj;
		item.sign = '';
		list += temp('\n%rank%.%name% - LV%level% 经验: %exp%', {
			rank,
			level: Profile.getLevel(item.exp)[0],
			name: '',
			...item,
		});
		rank += 1;
	});
	return ['本群等级排行:%list%', { list }];
});

Alias('发言排行', (_send, data) => {
	const result = loadData(data.group_id!);
	const arr: userData[] = [];
	Object.keys(result).forEach(Element => {
		if (Element === 'group') return;
		arr.push(result[Element]);
	});

	arr.sort((a, b) => b.msg - a.msg);

	let rank = 1;
	let list = '';
	arr.forEach(oldItem => {
		if (rank > 20) return;
		const item = oldItem as obj;
		item.sign = '';
		list += temp('\n%rank%.%name% - %msg%次', { rank, name: '', ...item });
		rank += 1;
	});
	return ['本群发言排行:%list%', { list }];
});

Alias('签到排行', (_send, data) => {
	const result = loadData(data.group_id!);
	const arr: userData[] = [];
	Object.keys(result).forEach(Element => {
		if (Element === 'group') return;
		arr.push(result[Element]);
	});

	arr.sort((a, b) => b.sign.length - a.sign.length);

	let rank = 1;
	let list = '';
	arr.forEach(oldItem => {
		if (rank > 20) return;
		const count = oldItem.sign.length;
		const item = oldItem as obj;
		item.sign = '';
		list += temp('\n%rank%.%name% - %count%次', { rank, count, name: '', ...item });
		rank += 1;
	});
	return ['本群签到排行:%list%', { list }];
});

Alias('猜数字', (_send, data) => {
	const result = Guess.start(data.user_id);
	return [
		'%at%这是一个%min%到%max%之间的神秘数字哦( •̀ ω •́ )✧,发送"猜 <number>"猜数字~',
		{ at: SDK.cq_at(data.user_id), ...result },
	];
});

Alias('猜', (_send, data) => {
	const at = SDK.cq_at(data.user_id);
	if (!Guess.guessData[data.user_id]) return ['%at%哎呀~你还有没有开始游戏哦<(＿　＿)>,发送"猜数字"开始游戏', { at }];
	const guess = parseInt(Core.args[1], 10);
	const { 0: answer, 1: count } = Guess.guessData[data.user_id];
	const result = Guess.guess(data.user_id, guess);

	if (!result) {
		if (count > 10)
			return ['%at%啊哈哈,这次你没有猜对我的数字哦(。・∀・)ノ,不行的话可以发送"放弃"结束本次游戏', { at }];
		if (guess > answer) {
			if (guess - answer > 20) return ['%at%哎呀,你猜的数字太大啦~再想想是一个更小的数字吧(。・∀・)ノ', { at }];
			return ['%at%虽然已经很接近了,但你猜的数字还是比答案大一点啦~(๑•́ ∀ •́๑)', { at }];
		}
		if (answer - guess > 20) return ['%at%你猜的数字太小咯~应该猜一个更大一点的数字才对╰(‵□′)╯', { at }];
		return ['%at%快要猜对啦!你猜的数字比正确答案还要小一丢丢哦( ́▽`)', { at }];
	}
	if (count <= 5) addExp(data.group_id!, data.user_id, getRandomInt(10, 5));
	if (count > 5 && count <= 10) addExp(data.group_id!, data.user_id, getRandomInt(5, 1));

	return ['%at%耶~你猜对啦!真厉害!总共猜了%num%次,太棒了Ψ(≧ω≦)Ψ', { at, num: result }];
}).params([{ must: true, name: 'number' }]);

Alias('放弃', (_send, data) => {
	Guess.giveup(data.user_id);
	return ['%at%放弃也没关系的,一起开心地玩游戏才最重要~(∩_∩)', { at: SDK.cq_at(data.user_id) }];
});

Alias('猜拳', (_send, data) => {
	const at = SDK.cq_at(data.user_id);
	if (!['石头', '剪刀', '布'].includes(Core.args[1])) {
		return ['%at%错啦错啦(╬▔皿▔)╯大错特错！要输入石头剪刀布中的一个才行哦~', { at }];
	}

	const result = Hand.start(Core.args[1]);
	const params = { at, output: result[1], input: Core.args[1] };
	if (result[0] === 1) {
		addExp(data.group_id!, data.user_id, 1);
		return ['%at%耶~你赢了!你出的«玩家出的拳»完美地打败我的%input%了!你太厉害啦 (≧∇≦)/', params];
	}
	if (result[0] === 0) {
		return ['%at%哎呀,我们果然默契无比,同时出了%input%,结局是平局啦 Σ(▼□▼〃)', params];
	}
	return ['%at%哈哈,这次我的%output%打败你的%input%了!不过不要灰心,再接再厉哦 (•ө•)♡', params];
}).params([{ must: true, name: '石头/剪刀/布' }]);

Core.hook(data => {
	if (!data.group_id) return true;
	const groupData = queryUser(data.group_id, data.user_id)[1];
	if (!(data.user_id in groupData)) groupData[data.user_id] = defaultData;
	groupData[data.user_id].msg += 1;
	groupData.group.msg += 1;
	saveData(groupData, data.group_id);
	if (data.message.toUpperCase().includes('CQ')) return true;
	if (data.message.length <= 100)
		addExp(data.group_id, data.user_id, Math.floor(data.message.length / 10), data.sender.nickname, false);
	if (data.message.length > 100)
		addExp(data.group_id, data.user_id, Math.floor(data.message.length / 20), data.sender.nickname, false);
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
