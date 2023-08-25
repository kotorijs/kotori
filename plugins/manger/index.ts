import path from 'path';
import { Core, getQq, temp } from 'plugins/kotori-core';
import { ACCESS, BOT_RESULT, SCOPE } from 'plugins/kotori-core/type';
import Content from 'plugins/kotori-core/class/class.content';
import { loadConfigP, saveConfigP } from 'plugins/kotori-core/method';
import { Api, Const, Event, EventDataType, Locale } from '@/tools';
import SDK from '@/utils/class.sdk';
import config from './config';
import { CACHE_MSG_TIMES, controlParams } from './method';

Locale.register(path.resolve(__dirname));

export class Main {
	private Event: Event;

	public constructor(event: Event, api: Api, consts: Const) {
		Main.Api = api;
		Main.Const = consts;
		this.Event = event;
		this.registerEvent();
	}

	public registerEvent = () => {
		this.Event.listen('on_group_increase', data => Main.onGroupIncrease(data));
		this.Event.listen('on_group_decrease', data => Main.onGroupDecrease(data));
	};

	public static Api: Api;

	public static Const: Const;

	public static checkWhiteList = (user: number, group?: number) => {
		if (user === this.Const.CONFIG.bot.master) return false;
		const result =
			(loadConfigP('whiteList.json') as number[]).includes(user) ||
			(group &&
				((loadConfigP(path.join(group!.toString(), 'whiteList.json')) as number[]).includes(user) ||
					(loadConfigP(path.join(group!.toString(), 'mangerList.json')) as number[]).includes(user)));
		return result;
	};

	private static onGroupIncrease = (data: EventDataType) => {
		if (!config.joinGroupWelcome || !Content.verifyFrom(data)) return;
		Main.Api.send_group_msg(
			temp('manger.auto.join_group_welcome', {
				at: SDK.cq_at(data.user_id),
			}),
			data.group_id!,
		);
	};

	private static onGroupDecrease = (data: EventDataType) => {
		if (!config.exitGroupAddBlack || !Content.verifyFrom(data)) return;
		const list = loadConfigP(path.join(data.group_id!.toString(), 'blackList.json')) as number[];
		list.push(data.user_id);
		saveConfigP(path.join(data.group_id!.toString(), 'blackList.json'), list);
		Main.Api.send_group_msg(
			temp('manger.auto.exit_group_add_black', {
				target: data.user_id,
			}),
			data.group_id!,
		);
	};
}

Core.hook((data, send) => {
	if (Content.verifyAccess(data) >= ACCESS.MANGER) return true;
	const { user_id: user, group_id: group } = data;
	if (Main.checkWhiteList(user, group)) return true;

	const result = (loadConfigP(`blackList.json`) as number[]).includes(user);
	if (
		!result &&
		(!group || !(loadConfigP(path.join(group!.toString(), 'blackList.json')) as number[]).includes(user))
	) {
		/* banword */
		const banwordList = loadConfigP('banword.json') as string[];
		for (const content of banwordList) {
			try {
				if (!new RegExp(content).test(data.message)) continue;
			} catch {
				if (!data.message.includes(content)) continue;
			}
			const result =
				getQq(data.message) === Main.Const.BOT.self_id ||
				data.message.includes(Main.Const.BOT.self_id.toString());
			if (result || !group) {
				send('manger.auto.ban_word_bot' /*  : 'manger.auto.ban_word' */, {
					at: SDK.cq_at(data.user_id),
				});
			}
			if (group) {
				// Main.Api.set_group_ban(group, data.user_id, result ? config.banwordBanTime * 3 : config.banwordBanTime);
				Main.Api.delete_msg(data.message_id);
			}
			if (!result) return false;
			const list = loadConfigP(`blackList.json`) as number[];
			list.push(data.user_id);
			saveConfigP('blackList.json', list);
			return false;
		}

		/* msg times */
		if (!group) return true;
		const user = group + data.user_id;

		if (
			!CACHE_MSG_TIMES[user] ||
			CACHE_MSG_TIMES[user].time + config.repeatRule.cycleTime * 1000 < new Date().getTime()
		) {
			CACHE_MSG_TIMES[user] = {
				time: new Date().getTime(),
				times: 1,
			};
		} else if (CACHE_MSG_TIMES[user].times > config.repeatRule.maxTimes) {
			Main.Api.set_group_ban(group, data.user_id, config.repeatBanTime);
			send('manger.auto.msg_times', { at: SDK.cq_at(data.user_id) });
			return false;
		} else {
			CACHE_MSG_TIMES[user].times += 1;
		}
		return true;
	}

	if (!group) return false;
	Main.Api.set_group_ban(group, user, config.banTime);
	send('manger.auto.exists_on_black.info', {
		target: data.user_id,
		type: Locale.locale(
			result ? 'manger.auto.exists_on_black.type.global' : 'manger.auto.exists_on_black.type.local',
		),
	});
	return false;
});

Core.menu('mange', 'groupMange').descr('manger.menu.group_mange.descr').scope(SCOPE.GROUP).access(ACCESS.MANGER);
Core.menu('admin', 'adminMange').descr('manger.menu.admin_mange.descr').access(ACCESS.ADMIN);

Core.cmd('ban', (_send, data) => {
	const target = getQq(Core.args[1]);
	const time = parseInt(Core.args[2], 10) * 60;
	if (target) {
		if (Main.checkWhiteList(target, data.group_id)) return 'manger.cmd.ban.fail';
		Main.Api.set_group_ban(data.group_id!, target, time);
		return [
			'manger.cmd.ban.user',
			{
				target,
				time: time / 60,
			},
		];
	}
	if (!target && Core.args[1]) return BOT_RESULT.ARGS_ERROR;
	Main.Api.set_group_whole_ban(data.group_id!);
	return 'manger.cmd.ban.all';
})
	.descr('manger.cmd.ban.descr')
	.menuId('groupMange')
	.scope(SCOPE.GROUP)
	.access(ACCESS.MANGER)
	.params([
		{
			must: false,
			name: 'qq/at',
		},
		{
			must: (config.banTime / 60).toString(),
			name: 'time(minutes)',
		},
	]);

Core.cmd('unban', (send, data) => {
	const target = getQq(Core.args[1]);
	if (target) {
		Main.Api.set_group_ban(data.group_id!, target, 0);
		send('manger.cmd.unban.user', {
			target,
		});
		return;
	}
	if (!target && Core.args[1]) {
		send(BOT_RESULT.ARGS_ERROR);
		return;
	}
	Main.Api.set_group_whole_ban(data.group_id!, false);
	send('manger.cmd.unban.all');
})
	.descr('manger.cmd.unban.descr')
	.menuId('groupMange')
	.scope(SCOPE.GROUP)
	.access(ACCESS.MANGER)
	.params([
		{
			must: false,
			name: 'qq/at',
		},
	]);

Core.cmd('black', (_send, data) => {
	const target = getQq(Core.args[1]);
	if (target && Main.checkWhiteList(target, data.group_id)) return 'manger.cmd.black.fail';

	return controlParams(path.join(data.group_id!.toString(), 'blackList.json'), [
		'manger.cmd.black.query',
		'manger.cmd.black.add',
		'manger.cmd.black.del',
		'manger.cmd.black.list',
	]);
})
	.menuId('groupMange')
	.scope(SCOPE.GROUP)
	.access(ACCESS.MANGER)
	.params({
		query: {
			descr: 'manger.cmd.black.descr.query',
		},
		add: {
			descr: 'manger.cmd.black.descr.add',
			args: [
				{
					must: true,
					name: 'qq/at',
				},
			],
		},
		del: {
			descr: 'manger.cmd.black.descr.del',
			args: [
				{
					must: true,
					name: 'qq/at',
				},
			],
		},
	});

Core.cmd('white', (send, data) => {
	const message = controlParams(path.join(data.group_id!.toString(), 'whiteList.json'), [
		'manger.cmd.white.query',
		'manger.cmd.white.add',
		'manger.cmd.white.del',
		'manger.cmd.white.list',
	]);
	send(message);
})
	.menuId('groupMange')
	.scope(SCOPE.GROUP)
	.access(ACCESS.MANGER)
	.params({
		query: {
			descr: 'manger.cmd.white.descr.query',
		},
		add: {
			descr: 'manger.cmd.white.descr.add',
			args: [
				{
					must: true,
					name: 'qq/at',
				},
			],
		},
		del: {
			descr: 'manger.cmd.white.descr.del',
			args: [
				{
					must: true,
					name: 'qq/at',
				},
			],
		},
	});

Core.cmd('kick', (_send, data) => {
	const target = getQq(Core.args[1]);
	if (target) {
		if (Main.checkWhiteList(target, data.group_id)) return 'manger.cmd.kick.fail';
		Main.Api.set_group_kick(data.group_id!, target);
		return ['manger.cmd.kick.info', { target }];
	}
	return BOT_RESULT.ARGS_ERROR;
})
	.descr('manger.cmd.kick.descr')
	.menuId('groupMange')
	.scope(SCOPE.GROUP)
	.access(ACCESS.MANGER)
	.params([
		{
			must: true,
			name: 'qq/at',
		},
	]);

Core.cmd('all', () => [
	'manger.cmd.all.info',
	{
		all: SDK.cq_at('all'),
		input: Core.args[1],
	},
])
	.descr('manger.cmd.all.descr')
	.menuId('groupMange')
	.scope(SCOPE.GROUP)
	.access(ACCESS.MANGER)
	.params([
		{
			must: true,
		},
	]);

Core.cmd('notice', (_send, data) => {
	const image = SDK.get_image(Core.args[1]);
	Main.Api.send_group_notice(
		data.group_id!,
		temp('manger.cmd.notice.info', {
			input: Core.args[1],
		}),
		image || undefined,
	);
})
	.descr('manger.cmd.notice.descr')
	.menuId('groupMange')
	.scope(SCOPE.GROUP)
	.access(ACCESS.MANGER)
	.params([
		{
			must: true,
		},
	]);

Core.cmd('blackg', () =>
	controlParams(`blackList.json`, [
		'manger.cmd.blackg.query',
		'manger.cmd.blackg.add',
		'manger.cmd.blackg.del',
		'manger.cmd.blackg.list',
	]),
)
	.menuId('adminMange')
	.access(ACCESS.ADMIN)
	.params({
		query: {
			descr: 'manger.cmd.blackg.descr.query',
		},
		add: {
			descr: 'manger.cmd.blackg.descr.add',
			args: [
				{
					must: true,
					name: 'qq/at',
				},
			],
		},
		del: {
			descr: 'manger.cmd.blackg.descr.del',
			args: [
				{
					must: true,
					name: 'qq/at',
				},
			],
		},
	});

Core.cmd('whiteg', () =>
	controlParams(`whiteList.json`, [
		'manger.cmd.whiteg.query',
		'manger.cmd.whiteg.add',
		'manger.cmd.whiteg.del',
		'manger.cmd.whiteg.list',
	]),
)
	.menuId('adminMange')
	.access(ACCESS.ADMIN)
	.params({
		query: {
			descr: 'manger.cmd.whiteg.descr.query',
		},
		add: {
			descr: 'manger.cmd.whiteg.descr.add',
			args: [
				{
					must: true,
					name: 'qq/at',
				},
			],
		},
		del: {
			descr: 'manger.cmd.whiteg.descr.del',
			args: [
				{
					must: true,
					name: 'qq/at',
				},
			],
		},
	});

Core.cmd('manger', (send, data) => {
	const message = controlParams(`${data.group_id}\\mangerList.json`, [
		'manger.cmd.manger.query',
		'manger.cmd.manger.add',
		'manger.cmd.manger.del',
		'manger.cmd.manger.list',
	]);
	send(message);
})
	.menuId('adminMange')
	.access(ACCESS.ADMIN)
	.params({
		query: {
			descr: 'manger.cmd.manger.descr.query',
		},
		add: {
			descr: 'manger.cmd.manger.descr.add',
			args: [
				{
					must: true,
					name: 'qq/at',
				},
			],
		},
		del: {
			descr: 'manger.cmd.manger.descr.del',
			args: [
				{
					must: true,
					name: 'qq/at',
				},
			],
		},
	});

Core.cmd('banword', () =>
	controlParams(
		`banword.json`,
		['manger.cmd.banword.query', 'manger.cmd.banword.add', 'manger.cmd.banword.del', 'manger.cmd.banword.list'],
		true,
	),
)
	.menuId('adminMange')
	.access(ACCESS.ADMIN)
	.params({
		query: {
			descr: 'manger.cmd.banword.descr.query',
		},
		add: {
			descr: 'manger.cmd.banword.descr.add',
			args: [
				{
					must: true,
					name: 'msg/RegExp',
				},
			],
		},
		del: {
			descr: 'manger.cmd.banword.descr.del',
			args: [
				{
					must: true,
					name: 'msg/RegExp',
				},
			],
		},
	});
export default Main;
