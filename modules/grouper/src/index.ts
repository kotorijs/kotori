import Kotori, { Tsu, getDate } from 'kotori-bot';

const hitokotoSchema = Tsu.Object({
  data: Tsu.Object({
    msg: Tsu.String(),
    from: Tsu.String().optional(),
    likes: Tsu.Number(),
    type: Tsu.String()
  })
});

/*
const defaultData = {
	sign: [],
	msg: 0,
	exp: 0,
};

const getPath(group: number)  path.join(Main.Consts.DATA_PLUGIN_PATH, `${group.toString()}.json`);

const loadData = (group: number): obj<userData> => {
	const data = (loadConfig(getPath(group), 'json', { group: defaultData }) as obj) || {};
	return data;
};

const saveData(data: object, group: number)  {
	saveConfig(getPath(group), data);
};

export const queryUserInfo(user: number)  {
	if (!(user in Main.UserInfo)) {
		return {
			userId: 0,
			nickname: '',
			sex: 'unknown',
			age: 0,
		};
	}
	return Main.UserInfo[user];
};

export const queryExp = (group: number, user: number): [userData, obj<userData>] => {
	const data = loadData(group);
	if (!(user in data)) {
		data[user as keyof typeof data] = defaultData;
	}

	saveData(data, group);
	return [data[user as keyof typeof data], data];
};

export const addExp(group: number, user: number, exp: number, tips: boolean = true)  {
	if (exp === 0) return;
	const data = loadData(group);

	if (!(user in data)) data[user as keyof typeof data] = defaultData;
	data.group.exp += exp;
	data[user as keyof typeof data].exp += exp;
	saveData(data, group);
	if (tips) Main.Api.send_group_msg(`${SDK.cq_at(user)}经验+${exp}`, group);
};

const Alias(keyword: CoreKeyword, callback: CoreVal)  {
	const entity = Core.alias(keyword, callback).menuId('funSys').scope(SCOPE.GROUP);
	return entity;
};

Alias('资料卡', async (_send, data) => {
	const userData = queryExp(data.groupId!, data.userId)[0];
	const image = new Profile(data, parseInt(Core.args[1], 10) || userData.exp).render();
	return SDK.cq_image((await image).replace('data:image/png;base64,', 'base64://'));
}); */

const signData: string[] = [];

Kotori.regexp(/^(签到|打卡)$/, async (data, session) => {
  const time = getDate();
  if (!session.groupId) return '';
  // const groupData = queryExp(data.groupId!, data.userId)[1];
  const at = session.el.at(session.userId);
  const identier = `${session.groupId}&${session.userId}&${time}`;
  if (signData.includes(identier)) return ['%at%今天已经签过到了，明天再来试吧', { at }];
  signData.push(identier);
  const res = await Kotori.http.get('https://hotaru.icu/api/hitokoto/v2/');
  const hitokoto = hitokotoSchema.check(res) ? `${res.data.msg}${res.data.from ? `——${res.data.from}` : ''}` : '';
  const image = session.el.image('https://api.btstu.cn/sjbz/api.php?lx=dongman&format=images');
  return ['%at%签到成功！这是你的奖励~%image%\n一言：%hitokoto%', { at, image, hitokoto }];
  /* 	if (!(data.userId in groupData)) groupData[data.userId] = defaultData;
	if (groupData[data.userId].sign.includes(time)) return ['%at%今天已经签过到了，明天再来试吧', { at }];
	groupData[data.userId].sign.push(time);
	saveData(groupData, data.groupId!);
	addExp(data.groupId!, data.userId, getRandomInt(20, 10));
	return [
		'%at%签到成功！这是你的奖励~%image%\n一言：%hitokoto%',
		{ at, image: SDK.cq_image('https://tenapi.cn/acg', undefined, undefined, 'normal', 0), hitokoto: await fetchText("https://hotaru.icu/api/hitokoto/v2/?format=text")},
	]; */
});
/* 
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
	const result = loadData(data.groupId!);
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
			name: queryUserInfo(data.userId).nickname,
			...item,
		});
		rank += 1;
	});
	return ['本群等级排行:%list%', { list }];
});

Alias('发言排行', (_send, data) => {
	const result = loadData(data.groupId!);
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
		list += temp('\n%rank%.%name% - %msg%次', { rank, name: queryUserInfo(data.userId).nickname, ...item });
		rank += 1;
	});
	return ['本群发言排行:%list%', { list }];
});

Alias('签到排行', (_send, data) => {
	const result = loadData(data.groupId!);
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
		list += temp('\n%rank%.%name% - %count%次', {
			rank,
			count,
			name: queryUserInfo(data.userId).nickname,
			...item,
		});
		rank += 1;
	});
	return ['本群签到排行:%list%', { list }];
});

Alias('猜数字', (_send, data) => {
	const result = Guess.start(data.userId);
	return [
		'%at%这是一个%min%到%max%之间的神秘数字哦( •̀ ω •́ )✧,发送"猜 <number>"猜数字~',
		{ at: SDK.cq_at(data.userId), ...result },
	];
});

Alias('猜', (_send, data) => {
	const at = SDK.cq_at(data.userId);
	if (!Guess.guessData[data.userId]) return ['%at%哎呀~你还有没有开始游戏哦<(＿.＿)>,发送"猜数字"开始游戏', { at }];
	const guess = parseInt(Core.args[1], 10);
	const { 0: answer, 1: count } = Guess.guessData[data.userId];
	const result = Guess.guess(data.userId, guess);

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
	if (count <= 5) addExp(data.groupId!, data.userId, getRandomInt(10, 5));
	if (count > 5 && count <= 10) addExp(data.groupId!, data.userId, getRandomInt(5, 1));

	return ['%at%耶~你猜对啦!真厉害!总共猜了%num%次,太棒了Ψ(≧ω≦)Ψ', { at, num: result }];
}).params([{ must: true, name: 'number' }]);

Alias('放弃', (_send, data) => {
	Guess.giveup(data.userId);
	return ['%at%放弃也没关系的,一起开心地玩游戏才最重要~(∩_∩)', { at: SDK.cq_at(data.userId) }];
});

Alias('猜拳', (_send, data) => {
	const at = SDK.cq_at(data.userId);
	if (!['石头', '剪刀', '布'].includes(Core.args[1])) {
		return ['%at%错啦错啦(╬▔皿▔)╯大错特错！要输入石头剪刀布中的一个才行哦~', { at }];
	}

	const result = Hand.start(Core.args[1]);
	const params = { at, output: result[1], input: Core.args[1] };
	if (result[0] === 1) {
		addExp(data.groupId!, data.userId, 1);
		return ['%at%耶~你赢了!你出的«玩家出的拳»完美地打败我的%input%了!你太厉害啦 (≧∇≦)/', params];
	}
	if (result[0] === 0) {
		return ['%at%哎呀,我们果然默契无比,同时出了%input%,结局是平局啦 Σ(▼□▼〃)', params];
	}
	return ['%at%哈哈,这次我的%output%打败你的%input%了!不过不要灰心,再接再厉哦 (•ө•)♡', params];
}).params([{ must: true, name: '石头/剪刀/布' }]);

Core.hook(data => {
	if (!data.groupId) return true;
	const groupData = queryExp(data.groupId, data.userId)[1];
	if (!(data.userId in groupData)) groupData[data.userId] = defaultData;
	groupData[data.userId].msg += 1;
	groupData.group.msg += 1;
	saveData(groupData, data.groupId);
	if (data.message.toUpperCase().includes('CQ')) return true;
	if (data.message.length <= 100) addExp(data.groupId, data.userId, Math.floor(data.message.length / 10), false);
	if (data.message.length > 100) addExp(data.groupId, data.userId, Math.floor(data.message.length / 20), false);
	return true;
});

Core.hook(data => {
	if (!data.groupId || !(data.userId in data)) {
		Main.UserInfo[data.userId] = data.sender;
		saveConfig(path.join(Main.Consts.DATA_PLUGIN_PATH, 'userinfo.json'), Main.UserInfo);
	}
	return true;
}); */ /* 

export class Main {
	static Consts: Const;

	static Api: Api;

	static UserInfo: obj<userInfo>;

	constructor(event: Event, api: Api, consts: Const) {
		Main.Consts = consts;
		Main.Api = api;
		Main.UserInfo = loadConfig(
			path.join(Main.Consts.DATA_PLUGIN_PATH, 'userinfo.json'),
			'json',
			{},
		) as obj<userInfo>;
		Main.UserInfo = Main.UserInfo || {};
		event.listen('on_group_msg', data => console.log(data.sender));
	}
}

export default Main;
 */
