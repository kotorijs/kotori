import { existsSync } from 'fs';
import path from 'path';
import { createPromptModule } from 'inquirer';
import { CONST, saveConfig } from '@/tools';
import type { CreateData } from '@/tools';

class Create {
	private result: CreateData;

	private manifestJson = () =>
		'{' +
		`\n    "name": "${this.result.name}",` +
		`\n    "version": "${this.result.version}",` +
		`\n    "description": "${this.result.description}",` +
		`\n    "author": "${this.result.author}",` +
		`\n    "license": "${this.result.license}"` +
		`\n}`;

	private indexTs = () =>
		`import type { Event, Api, Const, EventDataType } from '@/tools';` +
		`\nimport { stringProcess, stringSplit } from '@/tools';` +
		`\nimport config from './config';` +
		`\nimport { normal, obj } from './interface';` +
		`\nimport { log } from './method';` +
		`\n${
			this.result.style === 'class'
				? '\nclass Main {' +
				  '\n    /**' +
				  '\n     * @param {Event} Event' +
				  '\n     * @param {Api} Api' +
				  '\n     * @param {Const} Const Ps: optional' +
				  '\n     */' +
				  '\n    public constructor (private Event: Event, private Api: Api, private Const: Const) {' +
				  '\n        this.registerEvent()' +
				  '\n    }' +
				  '\n' +
				  '\n    /* Register Events Function */' +
				  '\n    private registerEvent = () => {' +
				  "\n        this.Event.listen('on_group_msg', (eventData: EventDataType) => this.handel(eventData));" +
				  "\n        this.Event.listen('on_private_msg', (data: obj) => {" +
				  "\n            if (data.message !== 'print') return;" +
				  '\n            this.Api.send_private_msg(this.Const.DATA_PLUGIN_PATH, data.user_id);' +
				  '\n        });' +
				  '\n    }' +
				  '\n' +
				  '\n    /* Handle Function */' +
				  '\n    private handel = (data: EventDataType) => {' +
				  '\n        /* Handle Message */' +
				  '\n        if (!stringProcess(data.message, config.cmd)) return;' +
				  '\n        const message: normal = stringSplit(data.message, config.cmd);' +
				  '\n        /* Send Message */' +
				  '\n        message && this.Api.send_group_msg(message, data.group_id!);' +
				  "\n        log('Send message:', message)" +
				  '\n    }' +
				  '\n}' +
				  '\nexport default Main;'
				: '\n/**' +
				  '\n * @param {Event} Event' +
				  '\n * @param {Api} Api' +
				  '\n * @param {Const} Const Ps: optional' +
				  '\n */' +
				  '\nexport default (Event: Event, Api: Api, Const: Const) => {' +
				  '\n    /* Register Events */' +
				  "\n    Event.listen('on_group_msg', (eventData: EventDataType) => handel(eventData));" +
				  "\n    Event.listen('on_private_msg', (data: obj) => {" +
				  "\n        if (data.message !== 'print') return;" +
				  '\n        Api.send_private_msg(Const.DATA_PLUGIN_PATH, data.user_id);' +
				  '\n    });' +
				  '\n' +
				  '\n    /*  Handle Function  */' +
				  '\n    const handel = (data: EventDataType) => {' +
				  '\n        /* Handle Message */' +
				  '\n        if (!stringProcess(data.message, config.cmd)) return;' +
				  '\n        const message: normal = stringSplit(data.message, config.cmd);' +
				  '\n        /* Send Message */' +
				  '\n        message && Api.send_group_msg(message, data.group_id!);' +
				  "\n        log('Send message:', message)" +
				  '\n    }' +
				  '\n}'
		}`;

	private coreIndexTs = () =>
		`import path from 'path';
import { Core } from 'plugins/kotori-core';
import { ACCESS, SCOPE } from 'plugins/kotori-core/type';
import { Event, Api, Const, Locale } from '@/tools';

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
	.access(ACCESS.ADMIN)
	.params([
		{
			must: true,
			name: 'message',
			rest: true,
		},
	]);` +
		`\n${
			this.result.style !== 'class'
				? '\nexport default (Event: Event, Api: Api, Consts: Const) => {\n    Event; Api; Consts;\n}'
				: '\nexport default class {' +
				  '\nprivate Event: Event;' +
				  '\n' +
				  '\nprivate Api: Api;' +
				  '\n' +
				  '\nprivtae Consts: Const;' +
				  '\n' +
				  '\n    public constructor(event: Event, api: Api, consts: Const) {' +
				  '\n        this.Event = event;' +
				  '\n        this.Api = api;' +
				  '\n        this.Consts = consts;' +
				  '\n    }' +
				  '\n}'
		}`;

	private configTs = 'export default {\n    cmd: "echo "\n}';

	private CoreConfigTs = 'export default {\n}';

	private localeJson = `{
    "echo.cmd.echo.descr": "send a message on group",
    "echo.cmd.echo.info": "%content%",
    "echo.cmd.print.descr": "send a message on privates",
    "echo.cmd.print.info": "Result: %content%"
}`;

	private readmeMd = `# ECHO

Send a message

**Version:** 1.0.0
**Author:** hotaru
**License:** GPL-3.0

## List of command

-   /print <...content> - send a message on privates#^^
-   /echo <...message> - send a message on group\\*^^

## Lang Support

-   ja_JP
-   en_US
-   zh_TW
-   zh_CN
`;

	private interfaceTs =
		'export type normal = string | number;' +
		'\n' +
		'\nexport interface obj {' +
		'\n    [key: string]: any' +
		'\n}';

	private methodTs = () =>
		`export const log = (...arg: string[]) => {\n    console.log('[${this.result.project}]', ...arg)\n}`;

	private PATH = () => path.join(CONST.PLUGIN_PATH, this.result.project);

	public constructor(data: CreateData) {
		this.result = data;
		this.result.license = 'GPL-3.0';
	}

	public init = () => {
		const PATH = this.PATH();
		if (existsSync(PATH)) {
			console.error('The project already exists. Please change the project name and try again!');
			process.exit();
		}

		const mode = this.result.mode === 'vanilla';
		saveConfig(path.join(PATH, 'manifest.json'), this.manifestJson());
		saveConfig(path.join(PATH, 'index.ts'), mode ? this.indexTs() : this.coreIndexTs());
		saveConfig(path.join(PATH, 'config.ts'), mode ? this.configTs : this.CoreConfigTs);
		saveConfig(path.join(PATH, 'type.ts'), this.interfaceTs);
		saveConfig(path.join(PATH, 'method.ts'), this.methodTs());
		if (!mode) {
			saveConfig(path.join(PATH, 'locales', 'en_US.json'), this.localeJson);
			saveConfig(path.join(PATH, 'README.md'), this.readmeMd);
		}
		console.info(`Successfully created ${this.result.project}!`);
	};
}

const DATA = [
	{
		type: 'input',
		name: 'project',
		message: 'Project name:',
		default: 'project',
	},
	{
		type: 'list',
		name: 'mode',
		message: 'Development mode:',
		default: 'vanilla',
		choices: [
			{ name: 'Vanilla development', value: 'vanilla' },
			{ name: 'Based on Kotori-Core Development', value: 'core' },
		],
	},
	{
		type: 'list',
		name: 'style',
		message: 'Syntax style:',
		default: 'class',
		choices: [
			{ name: 'Object oriented programming', value: 'class' },
			{ name: 'Functional programming', value: 'function' },
		],
	},
	{
		type: 'input',
		name: 'name',
		message: 'Plugin name:',
		default: 'test plugin',
	},
	{
		type: 'input',
		name: 'version',
		message: 'Version:',
		default: '1.0.0',
	},
	{
		type: 'input',
		name: 'description',
		message: 'Description:',
		default: 'This is a kotori-bot of plugin',
	},
	{
		type: 'input',
		name: 'author',
		message: 'Author:',
	},
];
(async () => {
	const result = await createPromptModule()(DATA);
	new Create(result).init();
})();
