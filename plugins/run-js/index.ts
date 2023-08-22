import path from 'path';
import { Core } from 'plugins/kotori-core';
import { Locale } from '@/tools';
import SandboxJs from './class/class.sandbox';

Locale.register(path.resolve(__dirname));

Core.cmd('runjs', () => {
	const Entity = new SandboxJs(Core.args[1]);
	Entity.run();
	const content = Entity.results;
	return ['runjs.cmd.runjs.info', { content }];
})
	.descr('runjs.cmd.runjs.descr')
	.menuId('queryTool')
	.params([
		{
			must: true,
			name: 'code',
			rest: true,
		},
	]);
