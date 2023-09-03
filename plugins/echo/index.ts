import path from 'path';
import { Core } from 'plugins/kotori-core';
import { ACCESS, SCOPE } from 'plugins/kotori-core/type';
import { Locale } from '@/tools';

Locale.register(path.resolve(__dirname));

Core.cmd('print', () => [
	'echo.msg.print.info',
	{
		content: Core.args[1],
	},
])
	.help('echo.help.print')
	.menuId('coreCom')
	.scope(SCOPE.PRIVATE)
	.access(ACCESS.ADMIN)
	.params([
		{
			must: true,
			rest: true,
		},
	]);

Core.cmd('echo', () => [
	'echo.msg.echo.info',
	{
		content: Core.args[1],
	},
])
	.help('echo.help.echo')
	.menuId('coreCom')
	.scope(SCOPE.GROUP)
	.params([
		{
			must: true,
			name: 'message',
			rest: true,
		},
	]);
