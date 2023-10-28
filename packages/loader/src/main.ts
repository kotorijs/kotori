/*
 * @Author: hotaru biyuehuya@gmail.com
 * @Blog: https://hotaru.icu
 * @Date: 2023-06-24 15:12:55
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2023-10-27 22:16:52
 */
import {
	Mixed,
	Adapter,
	KotoriError,
	eventDataConnect,
	eventDataDisconnect,
	getPackageInfo,
	isObj,
	none,
} from 'kotori-bot';
import './log';

const enum GLOBAL {
	REPO = 'https://github.com/biyuehu/kotori-bot',
}

class Main extends Mixed {
	/* global */
	private isDev = Mixed.options.node_env === 'dev';

	public run = async () => {
		this.catchError();
		this.listenMessage();
		this.loadAllModule();
		this.checkUpdate();
	};

	private readonly catchError = () => {
		const handleError = (err: Error | unknown, prefix: string) => {
			/* 			if (err instanceof Mixed.http.error) {
				Mixed.logger.error(err.toString());
				return;
			} */
			const isKotoriError = err instanceof KotoriError;
			Mixed.logger.error(isKotoriError ? '' : prefix, err);
			if (isKotoriError && err.name === 'CoreError') process.emit('SIGINT');
		};
		process.on('uncaughtExceptionMonitor', err => handleError(err, 'UCE'));
		process.on('unhandledRejection', err => handleError(err, 'UHR'));
		process.on('SIGINT', () => {
			process.exit();
		});
		if (this.isDev) Mixed.logger.debug('Run Info: Develop With Debuing...');
	};

	private readonly listenMessage = () => {
		const handleConnectInfo = (data: eventDataConnect | eventDataDisconnect) => {
			if (!data.info) return;
			Mixed.logger[data.normal ? 'log' : 'warn'](
				`[${data.adapter.platform}]`,
				`${data.adapter.identity}:`,
				data.info,
			);
		};

		Mixed.registeMessageEvent();
		Mixed.addListener('connect', handleConnectInfo);
		Mixed.addListener('disconnect', handleConnectInfo);
		Mixed.addListener('load_module', data => {
			if (!data.module) return;
			const { name, version, author } = data.module.package;
			Mixed.logger.info(
				`Successfully loaded ${data.service || 'module'} ${name} Version: ${version} ${
					Array.isArray(author) ? `Authors: ${author.join(',')}` : `Author: ${author}`
				}`,
			);
		});
		Mixed.addListener('load_all_module', data => {
			Mixed.logger.info(`Successfully loaded ${data.count} modules (plugins)`);
			this.loadAllAdapter();
		});
	};

	private readonly loadAllModule = () => {
		Mixed.moduleAll();
		if (this.isDev) Mixed.watchFile();
	};

	private readonly loadAllAdapter = () => {
		none(this);
		for (const botName of Object.keys(Mixed.configs.adapter)) {
			const botConfig = Mixed.configs.adapter[botName];
			if (botConfig.extend in Mixed.AdapterStack) {
				const bot = new Mixed.AdapterStack[botConfig.extend](botConfig, botName);
				if (!(botConfig.extend in Adapter.apiStack)) Adapter.apiStack[botConfig.extend] = [];
				Mixed.apiStack[botConfig.extend].push(bot.api);
				bot.start();
				continue;
			}
			Mixed.logger.warn(`Cannot find adapter '${botConfig.extend}' for ${botName}`);
		}
		const adapters: Adapter[] = [];
		Object.values(Mixed.apiStack).forEach(apis => {
			apis.forEach(api => adapters.push(api.adapter));
		});
		// Mixed.emit({ type: 'adapters', adapters });
	};

	private readonly checkUpdate = async () => {
		none(this);
		const params = { url: 'https://raw.githubusercontent.com/BIYUEHU/kotori-bot/master/package.json' };
		const version = getPackageInfo().version;
		const res = await Mixed.http
			.post('https://hotaru.icu/api/agent/', params)
			.catch(() => Mixed.logger.error('Get update failed, please check your network'));
		if (!res || !isObj(res)) {
			Mixed.logger.error(`Detection update failed`);
		} else if (version === res.version) {
			Mixed.logger.log('KotoriBot is currently the latest version');
		} else {
			Mixed.logger.warn(
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
