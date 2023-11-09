/*
 * @Author: hotaru biyuehuya@gmail.com
 * @Blog: https://hotaru.icu
 * @Date: 2023-06-24 15:12:55
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2023-11-09 21:23:37
 */
import { Adapter, KotoriError, EventType, isObj, ContentInstance, KotoriConfigs } from 'kotori-bot';
import Modules from './modules';
import { baseDir, getPackageInfo, globalConfigs } from './global';
import loadInfo from './log';

const enum GLOBAL {
	REPO = 'https://github.com/biyuehu/kotori-bot',
}

const isDev = 'Content.options.node_env'.toString() !== 'dev';

const kotoriConfigs: KotoriConfigs = {
	baseDir,
	configs: globalConfigs,
	options: {
		nodeEnv: isDev ? 'dev' : 'production',
	},
};

class Main extends ContentInstance {
	private ctx: Modules;

	public constructor() {
		Main.setInstance(new Modules(kotoriConfigs));
		super();
		this.ctx = Main.getInstance() as Modules;
	}

	public run = () => {
		loadInfo();
		this.catchError();
		this.listenMessage();
		this.loadAllModule();
		this.checkUpdate();
	};

	private readonly catchError = () => {
		const handleError = (err: Error | unknown, prefix: string) => {
			/* 			if (err instanceof Content.http.error) {
				Content.logger.error(err.toString());
				return;
			} */
			const isKotoriError = err instanceof KotoriError;
			/* this.ctx.logger.error */ console.error(isKotoriError ? '' : prefix, err);
			if (isKotoriError && err.name === 'CoreError') process.emit('SIGINT');
		};
		process.on('uncaughtExceptionMonitor', err => handleError(err, 'UCE'));
		process.on('unhandledRejection', err => handleError(err, 'UHR'));
		process.on('SIGINT', () => {
			process.exit();
		});
		if (isDev) this.ctx.logger.debug('Run Info: Develop With Debuing...');
	};

	private readonly listenMessage = () => {
		const handleConnectInfo = (data: EventType['connect'] | EventType['disconnect']) => {
			if (!data.info) return;
			this.ctx.logger[data.normal ? 'log' : 'warn'](
				`[${data.adapter.platform}]`,
				`${data.adapter.identity}:`,
				data.info,
			);
		};

		this.ctx.on('connect', handleConnectInfo);
		this.ctx.on('disconnect', handleConnectInfo);
		this.ctx.on('load_module', data => {
			if (!data.module) return;
			const { name, version, author } = data.module.package;
			this.ctx.logger.info(
				`Successfully loaded ${data.service || 'module'} ${name} Version: ${version} ${
					Array.isArray(author) ? `Authors: ${author.join(',')}` : `Author: ${author}`
				}`,
			);
		});
		this.ctx.on('load_all_module', data => {
			this.ctx.logger.info(`Successfully loaded ${data.count} modules (plugins)`);
			this.loadAllAdapter();
		});
	};

	private readonly loadAllModule = () => {
		this.ctx.moduleAll();
		if (isDev) this.ctx.watchFile();
	};

	private readonly loadAllAdapter = () => {
		for (const botName of Object.keys(this.ctx.configs.adapter)) {
			const botConfig = this.ctx.configs.adapter[botName];
			if (botConfig.extend in this.ctx.getAdapters) {
				const bot = new this.ctx.getAdapters[botConfig.extend](botConfig, botName, this.ctx);
				// if (!(botConfig.extend in Adapter)) Adapter.apis[botConfig.extend] = []; // I dont know whats this
				this.ctx.apiStack[botConfig.extend].push(bot.api);
				bot.start();
				continue;
			}
			this.ctx.logger.warn(`Cannot find adapter '${botConfig.extend}' for ${botName}`);
		}
		const adapters: Adapter[] = [];
		Object.values(this.ctx.apiStack).forEach(apis => {
			apis.forEach(api => adapters.push(api.adapter));
		});
		// this.ctx.emit({ type: 'adapters', adapters });
	};

	private readonly checkUpdate = async () => {
		const params = { url: 'https://raw.githubusercontent.com/BIYUEHU/kotori-bot/master/package.json' };
		const version = getPackageInfo().version;
		const res = await this.ctx.http
			.post('https://hotaru.icu/api/agent/', params)
			.catch(() => this.ctx.logger.error('Get update failed, please check your network'));
		if (!res || !isObj(res)) {
			this.ctx.logger.error(`Detection update failed`);
		} else if (version === res.version) {
			this.ctx.logger.log('KotoriBot is currently the latest version');
		} else {
			this.ctx.logger.warn(
				`The current version of KotoriBot is ${version}, and the latest version is ${res.version}. Please go to ${GLOBAL.REPO} to update`,
			);
		}
	};
}

export default Main;

/* Catch Error */
/*     private domainDemo: Domain.Domain = Domain.create();
        private catchError = () => this.domainDemo.on('error', err => {
            console.error(T.LOG_PREFIX.PLUGIN, err);
        });
     */
