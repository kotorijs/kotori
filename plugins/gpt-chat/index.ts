import path from 'path';
import { Core } from 'plugins/kotori-core';
import { fetchJ } from 'plugins/kotori-core/method';
import { BOT_RESULT } from 'plugins/kotori-core/type';
import { Locale } from '@/tools';
import config from './config';

Locale.register(path.resolve(__dirname));

Core.menu('gpts', 'gptChat').help('gpt_chat.menu.gpt_chat.help');

Core.cmd('gpt', async () => {
	const res = await fetchJ('http://chatgpt.hotaru.icu/v1/chat/completions', undefined, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${config.chatgpt}`,
		},
		body: JSON.stringify({
			model: 'gpt-3.5-turbo',
			messages: [
				{
					role: 'user',
					content: Core.args[1],
				},
			],
		}),
	});

	const result =
		!res || !res.choices || !res.choices[0] || !res.choices[0].message || !res.choices[0].message.content;
	return [
		result ? BOT_RESULT.SERVER_ERROR : 'gpt_chat.msg.gpt.info',
		result ? { res } : { content: res.choices[0].message.content },
	];
})
	.help('gpt_chat.help.gpt')
	.menuId('gptChat')
	.params([
		{
			must: true,
			rest: true,
		},
	]);

Core.cmd('cl', () => BOT_RESULT.REPAIRING)
	.help('gpt_chat.help.cl')
	.menuId('gptChat')
	.params([
		{
			must: true,
			rest: true,
		},
	]);
