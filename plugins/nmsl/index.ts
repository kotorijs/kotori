import { Core } from 'plugins/kotori-core';
import config from './config';
import Translate from './translate';

Core.cmd('nmsl', () => {
	const demo = new Translate(Core.args[1]);
	if (!demo.result) return config.fail;
	return [config.info, { content: demo.result }];
})
	.help(config.help)
	.menuId('funSys')
	.params([
		{
			must: false,
			name: config.args[0],
			rest: true,
		},
	]);
