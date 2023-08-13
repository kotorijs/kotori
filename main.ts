/*
 * @Author: Hotaru biyuehuya@gmail.com
 * @Blog: http://imlolicon.tk
 * @Date: 2023-06-24 15:12:55
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2023-08-13 17:00:18
 */
import Domain from 'domain';
import Process from 'process';
import ProcessController from '@/tools/process';
import * as T from '@/tools';
import Server from '@/server';
import ApiPrototype from '@/utils/class.api';
import { EVENT as EventPrototype } from '@/utils/class.event';
import Plugin from '@/tools/plugin';
import { existsSync } from 'fs';
import path from 'path';

export class Main {
    /* global */
    private const = T.CONST;
    private _config = T.BOTCONFIG.value;

    private signserverDemo: ProcessController;
    private gocqDemo: ProcessController;

    public constructor() {
        const { program, params, signserver } = this._config.control;
        this.signserverDemo = new ProcessController(
            path.basename(signserver), path.resolve(path.dirname(signserver)), [], this.logSignserver, this.logGocqhttpErr
        );
        this.gocqDemo = new ProcessController(
            path.basename(program), path.resolve(path.dirname(program)), params, this.logGocqhttp, this.logGocqhttpErr
        );
    }

    public run = (): void => {
        this.rewriteConsole();
        this.runSignserver();
        this.setProcess();
        this.connect();
    }

    /* Signserver */
    private runSignserver = () => {
        const { signserver } = this._config.control;
        if (!existsSync(path.resolve(signserver))) {
            signserver && console.warn(T.LOG_PREFIX.GCQ, 'Cannot find Signserver');
            return;
        }
        console.info(T.LOG_PREFIX.GCQ, 'Starting Signserver...');
        this.signserverDemo.start();
    }

    private logSignserver: T.ProcessCallback = data => {
        let dataRaw = data.toString();
        if (!dataRaw.includes('esponding')) return;
        console.info(T.LOG_PREFIX.GCQ, 'Signserver startup completed!');
        this.runGocqhttp();
    }

    /* go-cqhttp */
    private runGocqhttp = () => {
        const { program } = this._config.control;
        if (!existsSync(path.resolve(program))) {
            program && console.warn(T.LOG_PREFIX.GCQ, 'Cannot find Go-cqhttp');
            return;
        }
        console.info(T.LOG_PREFIX.SYS, 'Starting Go-cqhttp...');
        this.gocqDemo.start();
    }

    private logGocqhttpOn = true;
    private logGocqhttp: T.ProcessCallback = data => {
        if (!this.logGocqhttpOn) return;
        let dataRaw = data.toString();
        dataRaw = dataRaw.slice(-1) === '\n' ? dataRaw.substring(0, dataRaw.length - 1) : dataRaw;
        console.log(T.LOG_PREFIX.GCQ, dataRaw);
        if (!dataRaw.includes('WebSocket')) return;
        console.info(T.LOG_PREFIX.GCQ, 'Go-cqhttp startup completed!')
        this.logGocqhttpOn = false;
    }

    private logGocqhttpErr: T.ProcessCallback = data => {
        T.OPTIONS.catchError || console.error(T.LOG_PREFIX.GCQ, data.toString());
    }

    /* Rewrite Console */
    private _console = {
        log: console.log,
        info: console.info,
        warn: console.warn,
        error: console.error,
    };
    private rewriteConsole = () => {
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

    /* Registe Command */
    private setProcess = () => {
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
        const params = input.split(' ');
        const isOnline = () => {
            if (this._Api instanceof ApiPrototype) return true;
            result.msg = 'Currently offline';
            result.type = 2;
            return false;
        }

        switch (params[0]) {
            case T.PROCESS_CMD.STOP:
                result.msg = 'The program is stopping...';
                result.callback = () => process.exit();
                break;
            case T.PROCESS_CMD.BOT:
                if (!isOnline()) break;
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
                if (!isOnline()) break;
                for (let element of this._pluginEntityList) {
                    if (params[1] && element[1] !== params[1]) continue;
                    const res = element[3];
                    result.msg += (
                        `Id: ${element[1]} Name: ${res?.name ? res?.name : ''} Version: ${res?.version ? res?.version : ''}` +
                        `Description: ${res?.description ? res?.description : ''} Author: ${res?.author ? res?.author : ''} License: ${res?.license ? res?.license : ''} `
                    )
                }
                result.msg || (result.msg = `Cannot find plugin '${params[1]}'`, result.type = 3)
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
                    `\n${T.PROCESS_CMD.STOP} : Stop kotori-bot application` +
                    `\n${T.PROCESS_CMD.BOT} : Get bot status information` +
                    `\n${T.PROCESS_CMD.PLUGIN} <PluginId> : View all or some plugins manifest information` +
                    `\n${T.PROCESS_CMD.PASSWORD} : View username and password of admin website` +
                    `\n${T.PROCESS_CMD.SEND} <Message> <Type:private/group> <GroupId/UserId> : Send a message to bot's a friend and group` +
                    `\n${T.PROCESS_CMD.HELP} : Get command help information`
                );
                break;
            case T.PROCESS_CMD.SEND:
                if (!isOnline()) break;
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
        /* Constructor Api Interface*/
        this._Api = <T.Api>(new ApiPrototype(connectDemo.send));
        /* Constructor Event Listener */
        this._pluginEventList = [];
        this._Event = <T.Event>{
            listen: (eventName: T.EventListName, callback: Function) => this.EventPrototype.registerEvent(this._pluginEventList, eventName, callback)
        }

        /* Run plugins On Mode of Catch Error */
        if (T.OPTIONS.catchError) {
            this.catchError();
            this.domainDemo.run(() => this.runAllPlugin())
        } else {
            this.runAllPlugin()
        }

        /* Listen Connect Entity */
        connectDemo.listen(data => this.listenCallback(data));
    }

    protected listenCallback = (data: T.EventDataType) => {
        /* Record Heatbeat */
        if (data.post_type === 'meta_event') {
            if (data.sub_type === 'connect') {
                this.const.BOT.self_id = data.self_id;
                this.const.BOT.connect = data.time;
            }
            this.const.BOT.heartbeat = data.time;
            this.const.BOT.status = data.status;
        }

        /* Handle Receive Message Data Type */
        if (data.message) {
            typeof data.message !== 'string' || (data.message = data.raw_message);
        }

        /* Run Events Handler On Heatbeat */
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
                console.log(this.connectMode, this._config);
                console.error('Config.yml error, unknown connection mode!');
                process.exit();
        }
        console.info(`Current connection mode: ${this.connectMode}`);
    }


    /* Catch Error */
    private domainDemo: Domain.Domain = Domain.create();
    private catchError = () => this.domainDemo.on('error', err => {
        console.error(T.LOG_PREFIX.PLUGIN, err);
    })


    /* Plugin Methods */
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
                CONFIG: this._config,
                CONFIG_PLUGIN_PATH: `${T.CONST.CONFIG_PATH}\\plugins\\${element[1]}`,
                DATA_PLUGIN_PATH: `${T.CONST.DATA_PATH}\\plugins\\${element[1]}`,
                BOT: new Proxy(this.const.BOT, {})
            }
        ]
        if (element[1] === T.PLUGIN_GLOBAL.ADMIN_PLUGIN) params.push(new Proxy(Array.from(this._pluginEntityList), {}) as Object);
        demo.default.prototype ? new (demo.default as T.PluginEntityClass)(...params) : (demo.default as T.PluginEntityFunc)(...params);

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
