import { CONST, saveConfig } from '@/tools/function';
import type { CreateData } from '@/tools/interface';
import { createPromptModule } from 'inquirer';
import { existsSync } from 'fs';

class Create {
    private result: CreateData;

    private manifestJson = () => (
        '{' +
        `\n    "name": "${this.result.name}",` +
        `\n    "version": "${this.result.version}",` +
        `\n    "description": "${this.result.description}",` +
        `\n    "author": "${this.result.author}",` +
        `\n    "lisense": "${this.result.license}"` +
        `\n}`
    );

    private indexTs = () => (
        'import type { Event, Api, Const, EventDataType } from \'@/tools\';' +
        '\nimport { stringProcess, stringSplit } from \'@/tools\';' +
        '\nimport config from \'./config\';' +
        '\nimport { normal, obj } from \'./interface\';' +
        '\nimport { log } from \'./method\';' +
        '\n' +
        (this.result.style === 'class' ? (
            '\nclass Main {' + 
            '\n    /**' +
            '\n     * @param {Event} Event 事件' +
            '\n     * @param {Api} Api 接口' +
            '\n     * @param {Const} Const 常量(可选)' +
            '\n     */' +
            '\n    public constructor (private Event: Event, private Api: Api, private Const: Const) {' +
            '\n        this.registerEvent()' +
            '\n    }' +
            '\n' +
            '\n    /* 事件注册函数 */' +
            '\n    private registerEvent = () => {' +
            '\n        this.Event.listen(\'on_group_msg\', (eventData: EventDataType) => this.handel(eventData));' +
            '\n        this.Event.listen(\'on_private_msg\', (data: obj) => {' +
            '\n            if (data.message !== \'print\') return;' +
            '\n            this.Api.send_private_msg(this.Const._DATA_PLUGIN_PATH, data.user_id);' +
            '\n        });' +
            '\n    }' +
            '\n' +
            '\n    /* 处理函数 */' +
            '\n    private handel = (data: EventDataType) => {' +
            '\n        /* 处理消息 */' +
            '\n        if (!stringProcess(data.message, config.cmd)) return;' +
            '\n        const message: normal = stringSplit(data.message, config.cmd);' +
            '\n        /* 发送 */' +
            '\n        message && this.Api.send_group_msg(message, data.group_id!);' +
            '\n        log(`Send message: ${message}`)' +
            '\n    }' +
            '\n}' +
            '\nexport default Main;'
        ) : (
            '\n/**' +
            '\n * @param {Event} Event 事件' +
            '\n * @param {Api} Api 接口' +
            '\n * @param {Const} Const 常量(可选)' +
            '\n */' +
            '\nexport default (Event: Event, Api: Api, Const: Const) => {' +
            '\n    /* 注册事件 */' +
            '\n    Event.listen(\'on_group_msg\', (eventData: EventDataType) => handel(eventData));' +
            '\n    Event.listen(\'on_private_msg\', (data: obj) => {' +
            '\n        if (data.message !== \'print\') return;' +
            '\n        Api.send_private_msg(Const._DATA_PLUGIN_PATH, data.user_id);' +
            '\n    });' +
            '\n' +
            '\n    /* 处理函数 */' +
            '\n    const handel = (data: EventDataType) => {' +
            '\n        /* 处理消息 */' +
            '\n        if (!stringProcess(data.message, config.cmd)) return;' +
            '\n        const message: normal = stringSplit(data.message, config.cmd);' +
            '\n        /* 发送 */' +
            '\n        message && Api.send_group_msg(message, data.group_id!);' +
            '\n        log(`Send message: ${message}`)' +
            '\n    }' +
            '\n}'
        ))
    );

    private configTs = (
        'export default {' +
        '\n    cmd: "echo "' +
        '\n}'
    );

    private interfaceTs = (
        'export type normal = string | number;' +
        '\n' +
        '\nexport interface obj {' +
        '\n    [key: string]: any' +
        '\n}'
    )

    private methodTs = () => (
        'export const log = (arg: string) => {' +
        '\n    console.log(\'[' + this.result.project + ']\', arg)' +
        '\n}'
    )

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

        saveConfig(`${PATH}\\manifest.json`, this.manifestJson());
        saveConfig(`${PATH}\\index.ts`, this.indexTs());
        saveConfig(`${PATH}\\config.ts`, this.configTs);
        saveConfig(`${PATH}\\interface.ts`, this.interfaceTs);
        saveConfig(`${PATH}\\method.ts`, this.methodTs());
        console.info('Successfully created package.json!');
    }
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
        name: 'style',
        message: 'Syntax style:',
        default: 'class',
        choices: [
            { name: 'Object oriented programming', value: 'class' },
            { name: 'Functional programming', value: 'function' },
        ]
    },
    {
        type: 'input',
        name: 'name',
        message: 'Plugin name:',
        default: 'test plugin'
    },
    {
        type: 'input',
        name: 'version',
        message: 'Version:',
        default: '1.0.0'
    },
    {
        type: 'input',
        name: 'description',
        message: 'Description:',
        default: 'This is a kotori-bot of plugin'
    },
    {
        type: 'input',
        name: 'author',
        message: 'Author:'
    },
    {
        type: 'input',
        name: 'license',
        message: 'License:',
        default: 'MIT'
    }
];
(async () => {
    const result = await createPromptModule()(DATA);
    (new Create(result)).init();
})();
