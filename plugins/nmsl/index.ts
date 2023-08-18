import { Cmd, args, temp } from 'plugins/kotori-core';
import { ACCESS, SCOPE } from 'plugins/kotori-core/interface';
import config from './config';
import Translate from './translate';

Cmd.register(
	config.cmd,
	config.descr,
	'funSys',
	SCOPE.ALL,
	ACCESS.NORMAL,
	() => {
		if (!args[1]) return config.fail;
		const demo = new Translate(args[1]);
		return temp(config.info, {
			content: demo.result,
		});
	},
	[
		{
			must: false,
			name: config.args[0],
			rest: true,
		},
	],
);
