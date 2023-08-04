/*
 * @Author: Hotaru biyuehuya@gmail.com
 * @Blog: http://imlolicon.tk
 * @Date: 2023-06-24 15:12:55
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2023-08-04 16:30:42
 */
import Domain from 'domain';
import Process from 'process';
import { execute, exec } from '@/tools/process';
import * as T from '@/tools';
import Server from '@/server';
import ApiPrototype from '@/utils/class.api';
import { EVENT as EventPrototype } from '@/utils/class.event';
import Plugin from '@/tools/plugin';
import { existsSync } from 'fs';

export class Main {
    /* 设置全局常量 */
    private const = T.CONST;
    private _config = <T.BotConfig>T.loadConfig(`${this.const.ROOT_PATH}\\config.yml`, 'yaml');

    public run = (): void => {
        true || this.runGocqhttp;
        this.rewriteConsole();
        this.setProcess();
        this.connect();
    }


    /* 启动go-cqhttp */
    private runGocqhttp = (): void => {
        exec(`./go-cqhttp/go-cqhttp.exe`, 'Go-cqhttp started sucessfully')
        execute(`./go-cqhttp/go-cqhttp.bat`)
    }

    /* 更改Console */
    private _console = {
        log: console.log,
        info: console.info,
        warn: console.warn,
        error: console.error,
    };
    private rewriteConsole = (): void => {
        Object.keys(this._console).forEach(Key => {
            console[Key as keyof typeof this._console] = (...args: unknown[]) => {
                T._console[Key as keyof typeof this._console](this._console[Key as keyof typeof this._console], ...args);
            }
        });
        if (!T.OPTIONS.catchError) {
            console.warn('Run Info: Develop With Debuing...');
            return;
        };
        Process.on('unhandledRejection', err => {
            console.error(T.LOG_PREFIX.SYS, err)
        });
    }

    /* 注册指令 */
    private setProcess = (): void => {
        process.stdin.setEncoding('utf8');
        process.stdin.on('data', chunk => this.registerCmd(chunk));
    }
    private registerCmd = async (chunk: Buffer) => {
        const input = chunk.toString().trim();
        let result = {
            msg: '',
            type: 1,
            callback: () => { }
        };
        let params: string | string[];

        switch (input.split(' ')[0]) {
            case T.PROCESS_CMD.STOP:
                result.msg = 'The program is stopping...';
                result.callback = () => process.exit();
                break;
            case T.PROCESS_CMD.BOT:
                const BOT = this.const.BOT;
                const STATUS = BOT.status;
                const STAT = BOT.status.stat;
                result.msg = STATUS ? (
                    `ConnectTime: ${BOT.connect} HeatbeatTime: ${BOT.heartbeat} BotId: ${BOT.self_id}` +
                    ` AppEnabled: ${STATUS.app_enabled} AppGood: ${STATUS.app_good} AppInitialized: ${STATUS.app_initialized} Online: ${STATUS.online} PluginsGood: ${STATUS.plugins_good}` +
                    ` Packet: ${STAT.packet_sent} ${STAT.packet_received} ${STAT.packet_lost} Message: ${STAT.message_sent} ${STAT.message_received}` +
                    ` LostTimes: ${STAT.lost_times} DisconnectTimes: ${STAT.disconnect_times} LastMessageTime: ${STAT.last_message_time}`
                ) : 'Currently offline';
                STATUS || (result.type = 2);
                break;
            case T.PROCESS_CMD.PLUGIN:
                if (!this._pluginEntityList) {
                    result.msg = 'Currently offline';
                    result.type = 2;
                    break;
                }
                params = input.split(' ')[1];
                this._pluginEntityList.forEach(element => {
                    if (!params || element[1] === params[0]) {
                        result.msg += (
                            `Id: ${element[1]} Name: ${element[3]?.name} Version: ${element[3]?.version}` +
                            `Description: ${element[3]?.description} Author: ${element[3]?.author} License: ${element[3]?.license} `
                        )
                    }
                });
                result.msg || (result.msg = `Cannot find plugin '${params[0]}'`, result.type = 3)
                break;
            case T.PROCESS_CMD.PASSWORD:
                const PATH = `${this.const.PLUGIN_PATH}\\${T.PLUGIN_GLOBAL.ADMIN_PLUGIN}\\config.ts`;
                if (!existsSync(PATH)) {
                    result.msg = `Cannot find plugin '${T.PLUGIN_GLOBAL.ADMIN_PLUGIN}'`;
                    result.type = 2;
                    break;
                }
                const config = (await import(PATH)).default;
                result.msg = `User: ${config.web.user} Password: ${config.web.pwd}`;
                break;
            case T.PROCESS_CMD.HELP:
                result.msg = (
                    `Command List:` +
                    `\nStop kotori-bot application: ${T.PROCESS_CMD.STOP}` +
                    `\nGet bot status information: ${T.PROCESS_CMD.BOT}` +
                    `\nView all or some plugins manifest information: ${T.PROCESS_CMD.PLUGIN} <PluginId>` +
                    `\nView username and password of admin website: ${T.PROCESS_CMD.PASSWORD}` +
                    `\nSend a message to bot's a friend and group: ${T.PROCESS_CMD.SEND} <Message> <Type:private/friend> <FriendId/GroupId>` +
                    `\nGet command help information: ${T.PROCESS_CMD.HELP}`
                );
                break;
            case T.PROCESS_CMD.SEND:
                if (!(this._Api instanceof ApiPrototype)) {
                    result.msg = 'Currently offline';
                    result.type = 2;
                    break;
                }
                params = input.split(' ');
                if (!params[1] || (params[2] !== 'private' && params[2] !== 'group') || !params[3]) {
                    result.msg = 'Required parameter missing';
                    result.type = 3;
                    break;
                }
                (this._Api as T.Api).send_msg(params[2], params[1], parseInt(params[3]));
                result.msg = 'Message sent successfully';
                break;
            default:
                result.msg = `Unknown command ${input}, Please input '${T.PROCESS_CMD.HELP}' to view all command`;
                result.type = 3;
                break;
        }

        if (!result.msg) return;
        result.msg = `${T.LOG_PREFIX.CMD} ${result.msg}`
        switch (result.type) {
            case 1: console.info(result.msg); break;
            case 2: console.warn(result.msg); break;
            case 3: console.error(result.msg); break;
            default: console.log(result.msg); break;
        }
        result.callback();
    }


    /* Connect */
    protected connectMode = T.CONNECT_MODE[this._config.connect.mode];
    protected connectPrototype = Server[this.connectMode];
    protected EventPrototype = new EventPrototype;
    private _Api = new Object;
    private _Event = new Object;
    protected connectCallback = (connectDemo: T.ConnectMethod) => {
        /* 接口实例化 */
        this._Api = <T.Api>(new ApiPrototype(connectDemo.send));
        /* 事件注册实例化 */
        this._Event = <T.Event>{
            listen: (eventName: T.EventListName, callback: Function) => this.EventPrototype.registerEvent(this._pluginEventList, eventName, callback)
        }

        /* 错误捕获模式下运行插件 */
        if (T.OPTIONS.catchError) {
            this.catchError();
            this.domainDemo.run(() => this.runAllPlugin())
        } else {
            this.runAllPlugin()
        }

        /* 监听主进程 */
        connectDemo.listen(data => this.listenCallback(data));
    }
    protected listenCallback = (data: T.EventDataType) => {
        /* 心跳记录 */
        if (data.post_type === 'meta_event') {
            if (data.sub_type === 'connect') {
                this.const.BOT.self_id = data.self_id;
                this.const.BOT.connect = data.time;
            }
            this.const.BOT.heartbeat = data.time;
            this.const.BOT.status = data.status;
        }

        /* 每次心跳时运行事件监听 */
        this.runAllEvent(data);

        // 内置操作
        if (data.post_type !== 'message' || data.user_id !== this._config.bot.master || data.message_type !== 'private') return;
        if (T.stringProcess(data.message, this._config.bot['command-list'].reload)) {
            this._pluginEntityList.forEach(element => {
                element;
                // delete require.cache[require.resolve(`./plugins/test.ts`)];
            })
            // this.runAllPlugin(EventDemo, Api);
            // this.Api.send_private_msg('Successfully hot reloaded all plugins', data.user_id)
        }

    }
    protected connect = () => {
        switch (this.connectMode) {
            case 'Ws':
                new Server[this.connectMode](...[
                    this._config.connect.ws.url, this._config.connect.ws.port, this._config.connect.http['retry-time']
                ], this.connectCallback);
                break;
            case 'WsReverse':
                new Server[this.connectMode](this._config.connect['ws-reverse'].port, (data: T.ConnectMethod) => this.connectCallback(data));
                break;
            case 'Http':
                new Server[this.connectMode](...[
                    this._config.connect.http.url, this._config.connect.http.port, this._config.connect.http['retry-time'], this._config.connect.http['reverse-port']
                ], this.connectCallback);
                break;
            default:
                console.error('Config.yml error, unknown connection mode!')
                process.exit();
        }
        console.info(`Current connection mode: ${this.connectMode}`);
    }


    /* 捕获错误 */
    private domainDemo: Domain.Domain = Domain.create();
    private catchError = () => this.domainDemo.on('error', err => {
        console.error(T.LOG_PREFIX.PLUGIN, err);
    })


    /* 插件Plugin */
    protected _pluginEventList: [string, Function][] = new Array;
    protected runAllEvent = (data: T.EventDataType): void => this.EventPrototype.handleEvent(this._pluginEventList, data);
    private _pluginEntityList: T.PluginAsyncList = new Set();
    private runAllPlugin = (): void => {
        this._pluginEntityList = Plugin.loadAll();
        let num: number = 0;

        this._pluginEntityList.forEach(async element => {
            this.handlePluginData(element);
            num++;
            if (num !== this._pluginEntityList.size) return;
            console.info(`Successfully loaded ${num} plugins`);
        });
    }
    private handlePluginData = async (element: T.PluginData) => {
        const demo = await element[0];
        if (!demo.default) return;
        const params: [T.Event, T.Api, T.Const, Object?] = [
            this._Event as T.Event, this._Api as T.Api, {
                _CONFIG: this._config,
                _CONFIG_PLUGIN_PATH: `${T.CONST.CONFIG_PATH}\\plugins\\${element[1]}`,
                _DATA_PLUGIN_PATH: `${T.CONST.DATA_PATH}\\plugins\\${element[1]}`,
                _BOT: new Proxy(this.const.BOT, {})
            }
        ]
        if (element[1] === T.PLUGIN_GLOBAL.ADMIN_PLUGIN) params.push(new Proxy(Array.from(this._pluginEntityList), {}) as Object);
        demo.default.prototype ? new (demo.default as any)(...params) : demo.default(...params);

        const PLUGIN_INFO = element[3];
        if (PLUGIN_INFO) {
            let content: string = '';
            if (PLUGIN_INFO.name) content += `${PLUGIN_INFO.name} Plugin loaded successfully `
            if (PLUGIN_INFO.version) content += `Version: ${PLUGIN_INFO.version} `
            if (PLUGIN_INFO.license) content += `License: ${PLUGIN_INFO.license} `
            if (PLUGIN_INFO.author) content += `By ${PLUGIN_INFO.author}`
            console.info(content);
        }
    }
}

export default Main;
