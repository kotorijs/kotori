import path from 'path';
import { Core } from 'plugins/kotori-core';
import { BOT_RESULT } from 'plugins/kotori-core/type';
import { Locale } from '@/tools';
import SDK from '@/utils/class.sdk';
import screenshot from './screen';

Locale.register(path.resolve(__dirname));

Core.cmd('screen', async send => {
	if (!Core.args[1].includes('http')) return BOT_RESULT.ARGS_ERROR;
	send('web_screen.cmd.screen.tips');
	const buffer = await screenshot(Core.args[1]);
	return ['web_screen.cmd.screen.info', { image: SDK.cq_image(`base64://${buffer}`) }];
})
	.descr('web_screen.cmd.screen.descr')
	.menuId('queryTool')
	.params([
		{
			must: true,
			rest: true,
		},
	]);
