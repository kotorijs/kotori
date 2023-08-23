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

Core.cmd('runlua', () => {
	let code = Core.args[1];
	code = code.replace(/\\/g, `\\\\`);
	code = code.replace(/\r/g, `\\r`);
	code = code.replace(/\n/g, `\\n`);
	code = code.replace(/\t/g, `\\t`);
	// code = code.replace(/\b/g, `\\b`);
	code = code.replace(/"/g, `\\"`);
	code = code.replace(/'/g, `\\'`);
	code = `lua("${code}")`;
	const Entity = new SandboxJs(code);

	Entity.run();
	const content = Entity.results;
	return ['runjs.cmd.runjs.info', { content }];
})
	.descr('runjs.cmd.runlua.descr')
	.menuId('queryTool')
	.params([
		{
			must: true,
			name: 'code',
			rest: true,
		},
	]);
