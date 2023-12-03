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

	public registerEvent() {
		this.Event.listen('on_group_increase', data => Main.onGroupIncrease(data));
		this.Event.listen('on_group_decrease', data => Main.onGroupDecrease(data));
	}

	public static Api: Api;

	public static Const: Const;

	public static checkWhiteList(user: number, group?: number) {
		if (user === this.Const.CONFIG.bot.master) return false;
		const result =
			(loadConfigP('whiteList.json') as number[]).includes(user) ||
			(group &&
				((loadConfigP(path.join(group!.toString(), 'whiteList.json')) as number[]).includes(user) ||
					(loadConfigP(path.join(group!.toString(), 'mangerList.json')) as number[]).includes(user)));
		return result;
	}

	private static onGroupIncrease(data: EventDataType) {
		if (!config.joinGroupWelcome || !Content.verifyFrom(data)) return;
		Main.Api.send_group_msg(
			temp('manger.auto.join_group_welcome', {
				at: SDK.cq_at(data.user_id),
			}),
			data.group_id!,
		);
	}

	private static onGroupDecrease(data: EventDataType) {
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
	}
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
	send('manger.auto.exists_on_black', {
		target: data.user_id,
		type: Locale.locale(
			result ? 'manger.auto.exists_on_black.type.global' : 'manger.auto.exists_on_black.type.local',
		),
	});
	return false;
});

Core.menu('mange', 'groupMange').help('manger.menu.group_mange.help').scope(SCOPE.GROUP).access(ACCESS.MANGER);
Core.menu('admin', 'adminMange').help('manger.menu.admin_mange.help').access(ACCESS.ADMIN);

Kotori.command('ban')
	.action((_send, data) => {
		const target = getQq(data.args[0]);
		const time = parseInt(data.args[1], 10) * 60;
		if (target) {
			if (Main.checkWhiteList(target, data.group_id)) return 'manger.msg.ban.fail';
			Main.Api.set_group_ban(data.group_id!, target, time);
			return [
				'manger.msg.ban.user',
				{
					target,
					time: time / 60,
				},
			];
		}
		if (!target && data.args[0]) return BOT_RESULT.ARGS_ERROR;
		Main.Api.set_group_whole_ban(data.group_id!);
		return 'manger.msg.ban.all';
	})
	.help('manger.descr.ban')
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

Kotori.command('unban')
	.action((send, data) => {
		const target = getQq(data.args[0]);
		if (target) {
			Main.Api.set_group_ban(data.group_id!, target, 0);
			send('manger.msg.unban.user', {
				target,
			});
			return;
		}
		if (!target && data.args[0]) {
			send(BOT_RESULT.ARGS_ERROR);
			return;
		}
		Main.Api.set_group_whole_ban(data.group_id!, false);
		send('manger.msg.unban.all');
	})
	.help('manger.descr.unban')
	.menuId('groupMange')
	.scope(SCOPE.GROUP)
	.access(ACCESS.MANGER)
	.params([
		{
			must: false,
			name: 'qq/at',
		},
	]);

Kotori.command('black')
	.action((_send, data) => {
		const target = getQq(data.args[0]);
		if (target && Main.checkWhiteList(target, data.group_id)) return 'manger.msg.black.fail';

		return controlParams(path.join(data.group_id!.toString(), 'blackList.json'), [
			'manger.msg.black.query',
			'manger.msg.black.add',
			'manger.msg.black.del',
			'manger.msg.black.list',
		]);
	})
	.menuId('groupMange')
	.scope(SCOPE.GROUP)
	.access(ACCESS.MANGER)
	.params({
		query: {
			help: 'manger.descr.black.query',
		},
		add: {
			help: 'manger.descr.black.add',
			args: [
				{
					must: true,
					name: 'qq/at',
				},
			],
		},
		del: {
			help: 'manger.descr.black.del',
			args: [
				{
					must: true,
					name: 'qq/at',
				},
			],
		},
	});

Kotori.command('white')
	.action((send, data) => {
		const message = controlParams(path.join(data.group_id!.toString(), 'whiteList.json'), [
			'manger.msg.white.query',
			'manger.msg.white.add',
			'manger.msg.white.del',
			'manger.msg.white.list',
		]);
		send(message);
	})
	.menuId('groupMange')
	.scope(SCOPE.GROUP)
	.access(ACCESS.MANGER)
	.params({
		query: {
			help: 'manger.descr.white.query',
		},
		add: {
			help: 'manger.descr.white.add',
			args: [
				{
					must: true,
					name: 'qq/at',
				},
			],
		},
		del: {
			help: 'manger.descr.white.del',
			args: [
				{
					must: true,
					name: 'qq/at',
				},
			],
		},
	});

Kotori.command('kick')
	.action((_send, data) => {
		const target = getQq(data.args[0]);
		if (target) {
			if (Main.checkWhiteList(target, data.group_id)) return 'manger.msg.kick.fail';
			Main.Api.set_group_kick(data.group_id!, target);
			return ['manger.msg.kick', { target }];
		}
		return BOT_RESULT.ARGS_ERROR;
	})
	.help('manger.descr.kick')
	.menuId('groupMange')
	.scope(SCOPE.GROUP)
	.access(ACCESS.MANGER)
	.params([
		{
			must: true,
			name: 'qq/at',
		},
	]);

Kotori.command('all')
	.action(() => [
		'manger.msg.all',
		{
			all: SDK.cq_at('all'),
			input: data.args[0],
		},
	])
	.help('manger.descr.all')
	.menuId('groupMange')
	.scope(SCOPE.GROUP)
	.access(ACCESS.MANGER)
	.params([
		{
			must: true,
		},
	]);

Kotori.command('notice')
	.action((_send, data) => {
		const image = SDK.get_image(data.args[0]);
		Main.Api.send_group_notice(
			data.group_id!,
			temp('manger.msg.notice', {
				input: data.args[0],
			}),
			image || undefined,
		);
	})
	.help('manger.descr.notice')
	.menuId('groupMange')
	.scope(SCOPE.GROUP)
	.access(ACCESS.MANGER)
	.params([
		{
			must: true,
		},
	]);

Kotori.command('blackg')
	.action(() =>
		controlParams(`blackList.json`, [
			'manger.msg.blackg.query',
			'manger.msg.blackg.add',
			'manger.msg.blackg.del',
			'manger.msg.blackg.list',
		]),
	)
	.menuId('adminMange')
	.access(ACCESS.ADMIN)
	.params({
		query: {
			help: 'manger.descr.blackg.query',
		},
		add: {
			help: 'manger.descr.blackg.add',
			args: [
				{
					must: true,
					name: 'qq/at',
				},
			],
		},
		del: {
			help: 'manger.descr.blackg.del',
			args: [
				{
					must: true,
					name: 'qq/at',
				},
			],
		},
	});

Kotori.command('whiteg')
	.action(() =>
		controlParams(`whiteList.json`, [
			'manger.msg.whiteg.query',
			'manger.msg.whiteg.add',
			'manger.msg.whiteg.del',
			'manger.msg.whiteg.list',
		]),
	)
	.menuId('adminMange')
	.access(ACCESS.ADMIN)
	.params({
		query: {
			help: 'manger.descr.whiteg.query',
		},
		add: {
			help: 'manger.descr.whiteg.add',
			args: [
				{
					must: true,
					name: 'qq/at',
				},
			],
		},
		del: {
			help: 'manger.descr.whiteg.del',
			args: [
				{
					must: true,
					name: 'qq/at',
				},
			],
		},
	});

Kotori.command('manger')
	.action((send, data) => {
		const message = controlParams(`${data.group_id}\\mangerList.json`, [
			'manger.msg.manger.query',
			'manger.msg.manger.add',
			'manger.msg.manger.del',
			'manger.msg.manger.list',
		]);
		send(message);
	})
	.menuId('adminMange')
	.access(ACCESS.ADMIN)
	.params({
		query: {
			help: 'manger.descr.manger.query',
		},
		add: {
			help: 'manger.descr.manger.add',
			args: [
				{
					must: true,
					name: 'qq/at',
				},
			],
		},
		del: {
			help: 'manger.descr.manger.del',
			args: [
				{
					must: true,
					name: 'qq/at',
				},
			],
		},
	});

Kotori.command('banword')
	.action(() =>
		controlParams(
			`banword.json`,
			['manger.msg.banword.query', 'manger.msg.banword.add', 'manger.msg.banword.del', 'manger.msg.banword.list'],
			true,
		),
	)
	.menuId('adminMange')
	.access(ACCESS.ADMIN)
	.params({
		query: {
			help: 'manger.descr.banword.query',
		},
		add: {
			help: 'manger.descr.banword.add',
			args: [
				{
					must: true,
					name: 'msg/RegExp',
				},
			],
		},
		del: {
			help: 'manger.descr.banword.del',
			args: [
				{
					must: true,
					name: 'msg/RegExp',
				},
			],
		},
	});
export default Main;
