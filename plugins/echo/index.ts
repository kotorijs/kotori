import { Cmd, args, temp } from 'plugins/kotori-core';
import { ACCESS, SCOPE } from 'plugins/kotori-core/interface';
import config from './config';

Cmd.register(
	config.print.cmd,
	config.print.descr,
	'aboutInfo',
	SCOPE.PRIVATE,
	ACCESS.ADMIN,
	() =>
		temp(config.print.info, {
			content: args[1],
		}),
	[
		{
			must: false,
			name: config.echo.args[0],
			rest: true,
		},
	],
);

Cmd.register(
	config.echo.cmd,
	config.echo.descr,
	'aboutInfo',
	SCOPE.GROUP,
	ACCESS.MANGER,
	() =>
		temp(config.echo.info, {
			content: args[1],
		}),
	[
		{
			must: false,
			name: config.echo.args[0],
			rest: true,
		},
	],
);
