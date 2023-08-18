import { Cmd, args } from 'plugins/kotori-core';
import { ACCESS, SCOPE } from 'plugins/kotori-core/interface';
import config from './config';
import SandboxJs from './class.sandbox';

Cmd.register(
	config.cmd,
	config.descr,
	'queryTool',
	SCOPE.ALL,
	ACCESS.NORMAL,
	send => {
		const Entity = new SandboxJs(args[1]);
		Entity.run();
		const content = Entity.results;
		send(config.info, {
			content,
		});
	},
	[
		{
			must: true,
			name: config.args[0],
			rest: true,
		},
	],
);
