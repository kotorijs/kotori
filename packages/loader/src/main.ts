/*
 * @Author: hotaru biyuehuya@gmail.com
 * @Blog: https://hotaru.icu
 * @Date: 2023-06-24 15:12:55
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2023-10-05 19:23:35
 */
import { Adapter, KotoriError, Mixed, eventDataConnect, eventDataDisconnect, none } from '@kotori-bot/kotori';
import './log';

class Main extends Mixed {
	/* global */
	private isDev = Mixed.options.node_env === 'dev';

	public run = async () => {
		this.catchError();
		this.listenMessage();
		this.loadAllModule();
	};

	private catchError = () => {
		const handleError = (err: Error | unknown, prefix: string) => {
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

	private listenMessage = () => {
		none(this);
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

	private loadAllModule = () => {
		Mixed.moduleAll();
		if (this.isDev) Mixed.watchFile();
	};

	private loadAllAdapter = () => {
		none(this.isDev);
		for (const botName of Object.keys(Mixed.config.adapter)) {
			const botConfig = Mixed.config.adapter[botName];
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
		Mixed.emit({ type: 'ready_all', adapters });
	};
}

export default Main;

/* Catch Error */
/*     private domainDemo: Domain.Domain = Domain.create();
        private catchError = () => this.domainDemo.on('error', err => {
            console.error(T.LOG_PREFIX.PLUGIN, err);
        });
     */
