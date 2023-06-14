/*
 * @Author: Biyuehu biyuehuya@gmail.com
 * @Blog: http://imlolicon.tk
 * @Date: 2023-05-28 10:46:41
 */
import Domain from 'domain';
import Process from 'process';
import { execute, exec } from './src/process';
import * as Lib from './src/function';
import Server from './src/server';
import ApiPrototype from './src/method/api';
import EventPrototype from './src/method/event';
import Plugin from './src/plugin';

export class Main {
    /* 设置全局常量 */
    private _const = Lib._const;
    private _config: Lib.obj = Lib.loadConfig(`${this._const._ROOT_PATH}\\config.yml`, 'yaml');

    /* public constructor() {
        // 构造你mb的函数
    } */

    public run = () => {
        // this.runGocqhttp;
        this.rewriteConsole();
        this.connect();
    }


    /* 启动go-cqhttp */
    private runGocqhttp = () => {
        exec(`./go-cqhttp/go-cqhttp.exe`, 'Go-cqhttp started sucessfully')
        execute(`./go-cqhttp/go-cqhttp.bat`)
    }

    /* 更改Console */
    private _console: Lib.obj = {
        log: console.log,
        info: console.info,
        warn: console.warn,
        error: console.error,
    };
    private rewriteConsole = () => {
        Object.keys(this._console).forEach((Key: string) => {
            (console as Lib.obj)[Key] = (...args: any) => (Lib._console as Lib.obj)[Key]((this._console as Lib.obj)[Key], ...args);
        })
        Process.on('unhandledRejection', err => {
            console.error(`[System] ${err}`)
        });
    }

    /* Connect */
    private modeList: Lib.obj = {
        'http': 'Http',
        'ws': 'Ws',
        'ws-reverse': 'WsReverse'
    };
    protected connectPrototype = (Server as Lib.obj)[this.modeList[this._config.connect.mode]];
    protected connectConfig: Lib.obj = {
        Http: [
            this._config.connect['http'].url, this._config.connect['http'].port, this._config.connect['http']['retry-time'], this._config.connect['http']['reverse-port']
        ],
        Ws: [
            this._config.connect['ws'].url, this._config.connect['ws'].port, this._config.connect['ws']['retry-time']
        ],
        WsReverse: [this._config.connect['ws-reverse'].port]
    };
    protected EventPrototype = new EventPrototype;
    private _Api: Lib.obj = new Object;
    private _Event: Lib.obj = new Object;
    protected connect = () => {
        const connectMode = this.modeList[this._config.connect.mode];
        new this.connectPrototype(...this.connectConfig[connectMode], (connectDemo: Lib.obj) => {
            /* 接口实例化 */
            this._Api = new ApiPrototype(connectDemo.send);
            /* 事件注册实例化 */
            this._Event = {
                listen: (eventName: string, callback: Function) => this.EventPrototype.registerEvent(this._pluginEventList, eventName, callback)
            }

            /* 错误捕获模式下运行插件 */
            this.catchError();
            this.domainDemo.run(() => this.runAllPlugin())

            /* 监听主进程 */
            connectDemo.listen((data: Lib.obj) => {
                // if (data.post_type !== 'meta_event') console.info(data.post_type);
                if (!('message' in data)) return;
                // 内置操作
                if (data.post_type === 'message' && data.user_id === this._config.superadmin && data.message_type === 'private') {
                    switch (true) {
                        case Lib.stringProcess(data.message, this._config.commandlist.reload):
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
        console.error(`[Plugin] ${err}`)
    })


    /* 插件Plugin */
    protected _pluginEventList: [string, Function][] = new Array;
    protected runAllEvent = (data: Lib.obj) => this.EventPrototype.handleEvent(this._pluginEventList, data)
    private _pluginEntityList: Set<[Promise<Lib.obj>, string, string, Lib.obj?]> = new Set();
    private runAllPlugin = () => {
        this._pluginEntityList = Plugin.loadAll();
        let num: number = 0;
        this._pluginEntityList.forEach(async element => {
            const demo = await element[0];
            if (demo.default) {
                demo.default(this._Event, this._Api, {
                    _CONFIG_PLUGIN_PATH: `${Lib._const._CONFIG_PATH}\\plugins\\${element[1]}`,
                    _DATA_PLUGIN_PATH: `${Lib._const._DATA_PATH}\\plugins\\${element[1]}`
                });
                const PLUGIN_INFO = element[3];
                if (PLUGIN_INFO) {
                    let content: string = '';
                    if (PLUGIN_INFO.name) content += `${PLUGIN_INFO.name} Plugin loaded successfully `
                    if (PLUGIN_INFO.version) content += `Version: ${PLUGIN_INFO.version} `
                    if (PLUGIN_INFO.license) content += `License: ${PLUGIN_INFO.license} `
                    if (PLUGIN_INFO.author) content += `By ${PLUGIN_INFO.author}`
                    console.info(content)
                }
                num++;
            }
        });
        console.info(`Successfully loaded ${num} plugins`)
    }
}

export default Main;
