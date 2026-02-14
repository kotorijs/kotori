import { randomInt } from 'node:crypto'
import { KotoriPlugin, type Message, Messages, plugins, type SessionMsg, Tsu } from 'kotori-bot'

interface SignData {
	[propName: string]: string[]
}

const hitokotoSchema = Tsu.Object({
	msg: Tsu.String(),
	from: Tsu.String().optional()
})

const plugin = plugins([__dirname, '../'])

@plugin.import
export class GrouperPlugin extends KotoriPlugin<Tsu.infer<(typeof GrouperPlugin)['schema']>> {
	@plugin.schema
	public static readonly schema = Tsu.Object({
		guess: Tsu.Object({
			max: Tsu.Number().default(1000).describe('最大值'),
			min: Tsu.Number().default(0).describe('最小值'),
			range: Tsu.Number().default(100).describe('提示数字范围')
		})
			.default({ max: 1000, min: 0, range: 100 })
			.describe('猜数字游戏配置')
	}).default({ guess: { max: 1000, min: 0, range: 100 } })

	@plugin.inject
	public static readonly inject = ['file']

	@plugin.command({ template: 'sign - 签到', shortcut: ['签到', '打卡'] })
	public async sign(_: unknown, s: SessionMsg) {
		const at = Messages.mention(s.userId)
		const identity = `${s.api.adapter.identity}${s.groupId}&${s.userId}&${s.i18n.date()}`
		const signData = this.ctx.file.load<SignData>('signData.json', 'json', {})
		const { platform } = s.api.adapter
		if (signData[platform]?.includes(identity)) return s.format('{0} 今天已经签过到了，明天再来试吧', [at])

		if (!signData[platform]) signData[platform] = []
		signData[platform].push(identity)
		this.ctx.file.save('signData.json', signData)
		const res = await this.ctx.http.get('https://hotaru.icu/api/hitokoto')
		return s.quick([
			'{0} 签到成功！这是你的奖励~{1}\n一言：{2}',
			[
				at,
				Messages.image('https://api.btstu.cn/sjbz/api.php?lx=dongman&format=images'),
				hitokotoSchema.check(res) ? `${res.msg}${res.from ? `——${res.from}` : ''}` : '接口走丢了呜呜呜'
			]
		])
	}

	@plugin.command({ template: 'guess - 猜数字', shortcut: ['猜数字'] })
	public async guess(_: unknown, s: SessionMsg) {
		const at = Messages.mention(s.userId)
		const min = randomInt(this.config.guess.min, this.config.guess.max)
		const max = min + this.config.guess.range
		const answer = randomInt(min, max)
		let count = 0
		let guess: number | null = null

		while (true) {
			let reply: Message = ''
			if (count === 0 || guess === null) {
				s.quick('游戏开始！如果想要结束游戏可以发送“放弃”')
				reply = await s.prompt(
					s.format('{0} 这是一个 {1} 到 {2} 之间的神秘数字哦( •̀ ω •́ )✧，直接发送你要猜的数字吧~', [at, min, max])
				)
			} else if (Number.isNaN(guess)) {
				reply = await s.prompt(s.format('{0} 你输入的真的是个数字吗！不要逗我哦[○･｀Д´･ ○]~请重新发送', [at]))
			} else if (count > 10) {
				reply = await s.prompt(
					s.format('{0} 啊哈哈，这次你没有猜对我的数字哦(。・∀・)ノ,不行的话可以发送"放弃"结束本次游戏', [at])
				)
			} else if (guess > answer) {
				reply = await s.prompt(
					s.format(
						guess - answer > 20
							? '{0} 哎呀，你猜的数字太大啦~再想想是一个更小的数字吧(。・∀・)ノ'
							: '{0} 虽然已经很接近了，但你猜的数字还是比答案大一点啦~(๑•́ ∀ •́๑)',
						[at]
					)
				)
			} else if (guess < answer) {
				reply = await s.prompt(
					s.format(
						answer - guess > 20
							? '{0} 哎呀,你猜的数字太小咯~应该猜一个更大一点的数字才对╰(‵□′)╯'
							: '{0} 快要猜对啦!你猜的数字比正确答案还要小一丢丢哦( ́▽`)',
						[at]
					)
				)
			} else {
				return s.format('{0} 耶~你猜对啦!真厉害!总共猜了 {1} 次,太棒了Ψ(≧ω≦)Ψ', [at, count])
			}

			if (reply === '放弃') return s.format('{0} 放弃也没关系的，一起开心地玩游戏才最重要~(∩_∩)', [at])
			count += 1
			guess = Number.parseInt(reply.toString())
		}
	}

	@plugin.command({ template: 'mora - 剪刀↑石头↓布！', shortcut: ['猜拳', '箭头石头布'] })
	public async mora(_: unknown, s: SessionMsg) {
		const at = Messages.mention(s.userId)
		const reply = await s.prompt('游戏开始！发送你的拳！')
		const list = ['石头', '剪刀', '布']
		const answer = list[randomInt(0, 3)]
		if (!list.includes(reply.toString())) return s.format('{0} 哦豁，你输入的应该是石头剪刀布中的一个才对哦( ́▽`)', [at])
		if (answer === reply) return s.format('{0} 哎呀，我们果然默契无比同时出了 {1}，结局是平局啦 Σ(▼□▼〃)', [at, answer])
		if (
			(reply === '石头' && answer === '剪刀') ||
			(reply === '剪刀' && answer === '布') ||
			(reply === '布' && answer === '石头')
		) {
			return s.format('{0} 可恶！你完美地打败我的 {1} 😭😭', [at, answer])
		}
		return s.format('{0} 哈哈,这次我的 {1} 打败了你！不过不要灰心，再接再厉哦 (•ө•)♡', [at, answer])
	}
}

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
	public static Consts: Const;

	public static Api: Api;

	public static UserInfo: obj<userInfo>;

	public constructor(event: Event, api: Api, consts: Const) {
		Main.Consts = consts;
		Main.Api = api;
		Main.UserInfo = loadConfig(
			path.join(Main.Consts.DATA_PLUGIN_PATH, 'userinfo.json'),
			'json',
			{},
		) as obj<userInfo>;
		Main.UserInfo = Main.UserInfo || {};
		event.listen('on_on_message', data => console.log(data.sender));
	}
}

export default Main;
 */
