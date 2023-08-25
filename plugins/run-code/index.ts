import path from 'path';
import { Core } from 'plugins/kotori-core';
import { Locale } from '@/tools';
import JsBox from './class/class.jsbox';
import LuaBox from './class/class.luabox';

Locale.register(path.resolve(__dirname));

Core.cmd('runjs', () => {
	const Entity = new JsBox(Core.args[1]);
	Entity.run();
	const content = Entity.results;
	return ['runcode.cmd.runjs.info', { content }];
})
	.descr('runcode.cmd.runjs.descr')
	.menuId('queryTool')
	.params([
		{
			must: true,
			name: 'code',
			rest: true,
		},
	]);

Core.cmd('runlua', () => {
	const Entity = new LuaBox(Core.args[1]);
	Entity.run();
	const content = Entity.results;
	return ['runcode.cmd.runlua.info', { content }];
})
	.descr('runcode.cmd.runlua.descr')
	.menuId('queryTool')
	.params([
		{
			must: true,
			name: 'code',
			rest: true,
		},
	]);
