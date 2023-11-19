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

Core.cmd('access', (send, data) => {
	const message = controlParams(`${data.group_id}\\accessList.json`, [
		'access.msg.access.query',
		'access.msg.access.add',
		'access.msg.access.del',
		'access.msg.access.list',
	]);
	send(message);
})
	.menuId('adminMange')
	.access(ACCESS.ADMIN)
	.params({
		query: {
			help: 'access.descr.access.query',
		},
		add: {
			help: 'access.descr.access.add',
			args: [
				{
					must: true,
					name: 'qq/at',
				},
			],
		},
		del: {
			help: 'access.descr.access.del',
			args: [
				{
					must: true,
					name: 'qq/at',
				},
			],
		},
	});
