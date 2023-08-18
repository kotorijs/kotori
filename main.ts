/*
 * @Author: Hotaru biyuehuya@gmail.com
 * @Blog: http://imlolicon.tk
 * @Date: 2023-06-24 15:12:55
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2023-08-18 17:08:39
 */
// import Domain from 'domain';
import { existsSync } from 'fs';
import path from 'path';
import ProcessController from '@/tools/class/class.process';
import * as T from '@/tools';
import Server from '@/services';
import ApiPrototype from '@/utils/class.api';
import EventPrototype from '@/utils/class.event';

export class Main {
	/* global */
	private const = T.CONST;

	private config = T.BOTCONFIG;

	private signserverDemo: ProcessController;

	private gocqDemo: ProcessController;

	public constructor() {
		const { program, params, signserver } = this.config.control;
		this.signserverDemo = new ProcessController(
			path.basename(signserver),
			path.resolve(path.dirname(signserver)),
			[],
			this.logSignserver,
			T.OPTIONS.dev ? data => console.error(T.LOG_PREFIX.GCQ, data.toString()) : undefined,
		);
		this.gocqDemo = new ProcessController(
			path.basename(program),
			path.resolve(path.dirname(program)),
			params,
			this.logGocqhttp,
			T.OPTIONS.dev ? data => console.error(T.LOG_PREFIX.GCQ, data.toString()) : undefined,
		);
	}

	public run = (): void => {
		this.rewriteConsole();
		this.runSignserver();
		this.setProcess();
		this.connect();
		console.info(`Current connection mode: ${this.connectMode}`);
	};

	/* Signserver */
	private runSignserver = () => {
		const { signserver } = this.config.control;
		if (!existsSync(path.resolve(signserver))) {
			if (signserver) console.warn('Cannot find Signserver');
		}
		console.info('Starting Signserver...');
		this.signserverDemo.start();
	};

	private logSignserver: T.ProcessCallback = data => {
		const dataRaw = data.toString();
		if (!dataRaw.includes('esponding')) return;
		console.info('Signserver startup completed!');
		this.runGocqhttp();
	};

	/* go-cqhttp */
	private runGocqhttp = () => {
		const { program } = this.config.control;
		if (!existsSync(path.resolve(program))) {
			if (program) console.warn('Cannot find Go-cqhttp');
			return;
		}
		console.info('Starting Go-cqhttp...');
		this.gocqDemo.start();
	};

	private logGocqhttpOn = true;

	private logGocqhttp: T.ProcessCallback = data => {
		if (!this.logGocqhttpOn) return;
		let dataRaw = data.toString();
		dataRaw = dataRaw.slice(-1) === '\n' ? dataRaw.substring(0, dataRaw.length - 1) : dataRaw;
		console.log(T.LOG_PREFIX.GCQ, dataRaw);
		if (!dataRaw.includes('WebSocket')) return;
		console.info(T.LOG_PREFIX.GCQ, 'Go-cqhttp startup completed!');
		this.logGocqhttpOn = false;
	};

	/* Rewrite Console */
	private console = {
		log: console.log,
		info: console.info,
		warn: console.warn,
		error: console.error,
	};

	private rewriteConsole = () => {
		Object.keys(this.console).forEach(Key => {
			console[Key as keyof typeof this.console] = (...args: object[]) => {
				T.Logger[Key as keyof typeof this.console](this.console[Key as keyof typeof this.console], ...args);
			};
		});
		process.on('uncaughtExceptionMonitor', err => {
			console.error('UCE:', err);
		});
		process.on('unhandledRejection', err => {
			console.error('UHR', err);
		});
		process.on('SIGINT', () => {
			process.exit();
		});
		return T.OPTIONS.dev && console.warn('Run Info: Develop With Debuing...');
	};

	/* Registe Command */
	private setProcess = () => {
		process.stdin.setEncoding('utf8');
		const commandDemo = new T.Command(
			{ value: this.Api },
			{ value: this.pluginEntityList },
			this.signserverDemo,
			this.gocqDemo,
		);
		process.stdin.on('data', chunk => commandDemo.registerCmd(chunk));
	};

	/* Connect */
	protected connectMode = T.CONNECT_MODE[this.config.connect.mode];

	protected EventPrototype = new EventPrototype();

	private Api: T.obj = {};

	private Event = {};

	protected connectCallback: T.ConnectCallback = connectDemo => {
		/* Constructor Api Interface */
		const source = <T.Api>new ApiPrototype(connectDemo.send!);
		Object.keys(source).forEach(key => {
			this.Api[key] = source[key as keyof typeof source];
		});

		/* Constructor Event Listener */
		this.Event = <T.Event>{
			listen: (eventName: T.EventListName, callback: T.FuncListenCallback) =>
				this.EventPrototype.registerEvent(eventName, callback),
		};

		this.runAllPlugin();

		/* Listen Connect Entity */
		connectDemo.listen!(data => this.listenCallback(data));
	};

	protected listenCallback = (data: T.EventDataType) => {
		const newData = data;
		if (T.OPTIONS.dev && !('post_type' in newData)) console.log(newData);
		/* Record Heatbeat */
		if (newData.post_type === 'meta_event') {
			if (newData.sub_type === 'connect') {
				this.const.BOT.self_id = newData.self_id;
				this.const.BOT.connect = newData.time;
			}
			this.const.BOT.heartbeat = newData.time;
			this.const.BOT.status = newData.status;
		}

		/* Handle Receive Message newData Type */
		if (newData.message) {
			if (typeof newData.message !== 'string') newData.message = newData.raw_message;
		}

		/* Run Events Handler On Heatbeat */
		this.EventPrototype.handleEvent(newData);

		/* Inside Operation */
		/* if (data.post_type !== 'message' || data.message_type !== 'private' || data.user_id !== this.config.bot.master)
            return;
        if (T.stringProcess(data.message, this.config.bot['command-list'].reload)) {
            this.pluginEntityList.forEach(element => {
                element;
                delete require.cache[require.resolve(`./plugins/test.ts`)];
            })
            this.runAllPlugin(EventDemo, Api);
            this.Api.send_private_msg('Successfully hot reloaded all plugins', data.user_id)
        } */
	};

	protected connect = () => {
		switch (this.connectMode) {
			case 'Ws':
				return new Server[this.connectMode](
					...[
						this.config.connect.ws.url,
						this.config.connect.ws.port,
						this.config.connect.http['retry-time'],
					],
					this.connectCallback,
				);
			case 'WsReverse':
				return new Server[this.connectMode](this.config.connect['ws-reverse'].port, (data: T.ConnectMethod) =>
					this.connectCallback(data),
				);
			case 'Http':
				return new Server[this.connectMode](
					...[
						this.config.connect.http.url,
						this.config.connect.http.port,
						this.config.connect.http['retry-time'],
						this.config.connect.http['reverse-port'],
					],
					this.connectCallback,
				);
			default:
				console.log(this.connectMode, this.config);
				console.error('Config.yml error, unknown connection mode!');
				return process.exit();
		}
	};

	/* Catch Error */
	/*     private domainDemo: Domain.Domain = Domain.create();
        private catchError = () => this.domainDemo.on('error', err => {
            console.error(T.LOG_PREFIX.PLUGIN, err);
        });
     */

	/* Plugin Methods */
	protected pluginEventList: [string, T.FuncListenCallback][] = [];

	private pluginEntityList: T.PluginAsyncList = new Set();

	private runAllPlugin = (): void => {
		const source = T.Plugin.loadAll();
		this.pluginEntityList.forEach(value => this.pluginEntityList.delete(value));
		source.forEach(value => this.pluginEntityList.add(value));
		let num = 0;
		let useful = 0;
		this.pluginEntityList.forEach(element => {
			if (element[4]) useful += 1;
		});

		this.pluginEntityList.forEach(async element => {
			if (!element[4]) return;
			this.handlePluginData(element);
			num += 1;
			if (num !== useful) return;
			console.info(`Successfully loaded ${num} plugins`);
		});
	};

	private handlePluginData = async (element: T.PluginData) => {
		const PLUGIN_INFO = element[3];
		if (PLUGIN_INFO) {
			let content = '';
			if (PLUGIN_INFO.name) content += `${PLUGIN_INFO.name} Plugin loaded successfully `;
			if (PLUGIN_INFO.version) content += `Version: ${PLUGIN_INFO.version} `;
			if (PLUGIN_INFO.license) content += `License: ${PLUGIN_INFO.license} `;
			if (PLUGIN_INFO.author) content += `By ${PLUGIN_INFO.author}`;
			if (content) console.info(content);
		}

		const demo = await element[0];
		if (!demo.default) return;
		const params: [T.Event, T.Api, T.Const, object?, [ProcessController, ProcessController]?] = [
			this.Event as T.Event,
			this.Api as unknown as T.Api,
			{
				CONFIG: T.BOTCONFIG,
				ROOT_PATH: T.CONST.ROOT_PATH,
				CONFIG_PLUGIN_PATH: `${T.CONST.CONFIG_PATH}\\plugins\\${element[1]}`,
				DATA_PLUGIN_PATH: `${T.CONST.DATA_PATH}\\plugins\\${element[1]}`,
				BOT: new Proxy(this.const.BOT, {}),
			},
		];
		if (element[1] === T.PLUGIN_GLOBAL.ADMIN_PLUGIN || element[1] === T.PLUGIN_GLOBAL.CORE_PLUGIN) {
			params.push(new Proxy(Array.from(this.pluginEntityList), {}));
		}
		if (element[1] === T.PLUGIN_GLOBAL.CORE_PLUGIN) params.push([this.gocqDemo, this.signserverDemo]);
		if (demo.default.prototype) {
			JSON.stringify(new (demo.default as T.PluginEntityClass)(...params));
			return;
		}
		(demo.default as T.PluginEntityFunc)(...params);
	};
}

export default Main;
