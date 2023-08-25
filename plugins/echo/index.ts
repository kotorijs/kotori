import path from 'path';
import { Core } from 'plugins/kotori-core';
import { ACCESS, SCOPE } from 'plugins/kotori-core/type';
import { Locale } from '@/tools';

Locale.register(path.resolve(__dirname));

Core.cmd('print', () => [
	'echo.cmd.print.info',
	{
		content: Core.args[1],
	},
])
	.descr('echo.cmd.print.descr')
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
	'echo.cmd.echo.info',
	{
		content: Core.args[1],
	},
])
	.descr('echo.cmd.echo.descr')
	.menuId('coreCom')
	.scope(SCOPE.GROUP)
	.access(ACCESS.MANGER)
	.params([
		{
			must: true,
			name: 'message',
			rest: true,
		},
	]);
