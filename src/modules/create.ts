import { existsSync } from 'fs';
import { createPromptModule } from 'inquirer';
import { CONST, saveConfig } from '@/tools/function';
import type { CreateData } from '@/tools/type';

class Create {
	private result: CreateData;

	private manifestJson = () =>
		'{' +
		`\n    "name": "${this.result.name}",` +
		`\n    "version": "${this.result.version}",` +
		`\n    "description": "${this.result.description}",` +
		`\n    "author": "${this.result.author}",` +
		`\n    "lisense": "${this.result.license}"` +
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
		`\nimport { Cmd, args, temp } from 'plugins/kotori-core';` +
		`\nimport { ACCESS, SCOPE } from 'plugins/kotori-core/interface';` +
		`\nimport config from './config';` +
		`\nimport { Api, Const } from '@/tools';` +
		`\n\nCmd.register(config.echo.cmd, config.echo.descr, 'aboutInfo', SCOPE.GROUP, ACCESS.NORMAL, () => {` +
		`\n    return temp(config.echo.info, {` +
		`\n        content: args[1]` +
		`\n    });` +
		`\n}, [{` +
		`\n    must: false, name: config.echo.args[0], rest: true` +
		`\n}]);` +
		`\n\nCmd.register(config.echo.cmd, config.echo.descr, 'aboutInfo', SCOPE.PRIVATE, ACCESS.NORMAL, () => {` +
		`\n    return temp(config.echo.info, {` +
		`\n        content: args[1]` +
		`\n    });` +
		`\n}, [{` +
		`\n    must: false, name: config.echo.args[0], rest: true` +
		`\n}]);` +
		`\n${
			this.result.style === 'class'
				? '\nexport default (Event: Event, Api: Api, Const_: Const) => {\n    Event; Api; Const_;\n}'
				: '\nexport default class {' +
				  '\n    public constructor(private Event: Event, private Api: Api, private _Const__: Const) {' +
				  '\n        this.Event; this.Api; this.Const_;' +
				  '\n    }' +
				  '\n}'
		}`;

	private configTs = 'export default {\n    cmd: "echo "\n}';

	private CoreConfigTs =
		'\nexport default {' +
		'\n    echo: {' +
		"\n        cmd: '/echo'," +
		"\n        descr: 'send a message on groups'," +
		'\n        args: [' +
		"\n            'content'" +
		'\n        ],' +
		"\n        info: '%content%'" +
		'\n    },' +
		'\n    print: {' +
		"\n        cmd: '/print'," +
		"\n        descr: 'send a message on privates'," +
		'\n        args: [' +
		"\n            'message'" +
		'\n        ],' +
		"\n        info: 'Result: %content%'" +
		'\n    },' +
		'\n}';

	private interfaceTs =
		'export type normal = string | number;' +
		'\n' +
		'\nexport interface obj {' +
		'\n    [key: string]: any' +
		'\n}';

	private methodTs = () =>
		`export const log = (...arg: string[]) => {\n    console.log('[${this.result.project}]', ...arg)\n}`;

	private PATH = () => `${CONST.PLUGIN_PATH}\\${this.result.project}`;

	public constructor(data: CreateData) {
		this.result = data;
	}

	public init = () => {
		const PATH = this.PATH();
		if (existsSync(PATH)) {
			console.error('The project already exists. Please change the project name and try again!');
			process.exit();
		}

		const mode = this.result.mode === 'vanilla';
		saveConfig(`${PATH}\\manifest.json`, this.manifestJson());
		saveConfig(`${PATH}\\index.ts`, mode ? this.indexTs() : this.coreIndexTs());
		saveConfig(`${PATH}\\config.ts`, mode ? this.configTs : this.CoreConfigTs);
		saveConfig(`${PATH}\\type.ts`, this.interfaceTs);
		saveConfig(`${PATH}\\method.ts`, this.methodTs());
		console.info('Successfully created package.json!');
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
	{
		type: 'input',
		name: 'license',
		message: 'License:',
		default: 'MIT',
	},
];
(async () => {
	const result = await createPromptModule()(DATA);
	new Create(result).init();
})();
