/*
 * @Author: Biyuehu biyuehuya@gmail.com
 * @Blog: http://imlolicon.tk
 * @Date: 2023-05-28 10:46:41
 */
import Domain from 'domain';
import Process from 'process';
import { execute, exec } from './src/process';
import { loadConfig, _const as __const, _console, stringProcess } from './src/function';
import Server from './src/server';
import ApiPrototype from './src/method/api';
import { Event as EventPrototype } from './src/method/event';
import Plugin from './src/plugin';
import { BotConfig, EventDataType, ConnectMethod, PluginAsyncList, Event, Api } from 'src/interface';

export class Main {
    /* 设置全局常量 */
    private _const = __const;
    private _config = <BotConfig>loadConfig(`${this._const._ROOT_PATH}\\config.yml`, 'yaml');

    /* public constructor() {
        // 构造你mb的函数
    } */

    public run = (): void => {
        // this.runGocqhttp;
        this.rewriteConsole();
        this.connect();
    }


    /* 启动go-cqhttp */
    private runGocqhttp = (): void => {
        exec(`./go-cqhttp/go-cqhttp.exe`, 'Go-cqhttp started sucessfully')
        execute(`./go-cqhttp/go-cqhttp.bat`)
    }

    /* 更改Console */
    private _console: Object = {
        log: console.log,
        info: console.info,
        warn: console.warn,
        error: console.error,
    };
    private rewriteConsole = (): void => {
        Object.keys(this._console).forEach((Key: string) => {
            (<Object>console)[Key] = (...args: unknown[]) => (<Object>_console)[Key]((<Object>this._console)[Key], ...args);
        })
        Process.on('unhandledRejection', err => {
            console.error(`[System] ${err}`)
        });
    }

    /* Connect */
    private modeList: Object = {
        'http': 'Http',
        'ws': 'Ws',
        'ws-reverse': 'WsReverse'
    };
    protected connectPrototype = (<Object>Server)[this.modeList[this._config.connect.mode]];
    protected connectConfig: Object = {
        Http: [
            (this._config.connect['http']).url, this._config.connect['http'].port, this._config.connect['http']['retry-time'], this._config.connect['http']['reverse-port']
        ],
        Ws: [
            this._config.connect['ws'].url, this._config.connect['ws'].port, this._config.connect['ws']['retry-time']
        ],
        WsReverse: [this._config.connect['ws-reverse'].port]
    };
    protected EventPrototype = new EventPrototype;
    private _Api: object = new Object;
    private _Event: object = new Object;
    protected connect = () => {
        const connectMode = this.modeList[this._config.connect.mode];
        new this.connectPrototype(...this.connectConfig[connectMode], (connectDemo: ConnectMethod) => {
            /* 接口实例化 */
            this._Api = <Api>(new ApiPrototype(connectDemo.send));
            /* 事件注册实例化 */
            this._Event = <Event>{
                listen: (eventName: string, callback: Function) => this.EventPrototype.registerEvent(this._pluginEventList, eventName, callback)
            }

            /* 错误捕获模式下运行插件 */
            this.catchError();
            this.domainDemo.run(() => this.runAllPlugin())

            /* 监听主进程 */
            connectDemo.listen((data: EventDataType) => {
                /* 心跳记录 */
                if (data.post_type === 'meta_event') {
                    if (data.sub_type === 'connect') {
                        this._const._BOT.self_id = data.self_id;
                        this._const._BOT.connect = data.time;
                    }
                    this._const._BOT.heartbeat = data.time;
                    this._const._BOT.status = data.status;
                };
                if (!('message' in data)) return;

                // 内置操作
                if (data.post_type === 'message' && data.user_id === this._config.bot.master && data.message_type === 'private') {
                    switch (true) {
                        case stringProcess(data.message, this._config.bot['command-list'].reload):
                            this._pluginEntityList.forEach(element => {
                                // delete require.cache[require.resolve(`./plugins/test.ts`)];
                            })
                            // this.runAllPlugin(EventDemo, Api);
                            // this.Api.send_private_msg('Successfully hot reloaded all plugins', data.user_id)
                            break;
                    }
                }

                /* 每次心跳时运行事件监听 */
                this.runAllEvent(data);
            });
        });
        console.info(`Current connection mode: ${connectMode}`);
    }


    /* 捕获错误 */
    private domainDemo: Domain.Domain = Domain.create();
    private catchError = () => this.domainDemo.on('error', err => {
        console.error(`[Plugin] ${err}`);
    })


    /* 插件Plugin */
    protected _pluginEventList: [string, Function][] = new Array;
    protected runAllEvent = (data: EventDataType): void => this.EventPrototype.handleEvent(this._pluginEventList, data)
    private _pluginEntityList: PluginAsyncList = new Set();
    private runAllPlugin = (): void => {
        this._pluginEntityList = Plugin.loadAll();
        let num: number = 0;
        this._pluginEntityList.forEach(async element => {
            const demo = await element[0];
            if (demo.default) {
                demo.default(<Event>this._Event, <Api>this._Api, {
                    _CONFIG_PLUGIN_PATH: `${__const._CONFIG_PATH}\\plugins\\${element[1]}`,
                    _DATA_PLUGIN_PATH: `${__const._DATA_PATH}\\plugins\\${element[1]}`,
                    _BOT: new Proxy(this._const._BOT, {})
                });
                const PLUGIN_INFO = element[3];
                if (PLUGIN_INFO) {
                    let content: string = '';
                    if (PLUGIN_INFO.name) content += `${PLUGIN_INFO.name} Plugin loaded successfully `
                    if (PLUGIN_INFO.version) content += `Version: ${PLUGIN_INFO.version} `
                    if (PLUGIN_INFO.license) content += `License: ${PLUGIN_INFO.license} `
                    if (PLUGIN_INFO.author) content += `By ${PLUGIN_INFO.author}`
                    console.info(content);
                }
                num++;

                if (num === this._pluginEntityList.size) {
                    console.info(`Successfully loaded ${num} plugins`);
                }
            }
        });
    }
}

export default Main;
