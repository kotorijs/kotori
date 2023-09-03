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
	return ['runcode.msg.runjs.info', { content }];
})
	.help('runcode.help.runjs')
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
	return ['runcode.msg.runlua.info', { content }];
})
	.help('runcode.help.runlua')
	.menuId('queryTool')
	.params([
		{
			must: true,
			name: 'code',
			rest: true,
		},
	]);
