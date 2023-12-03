/*
 * @Author: hotaru biyuehuya@gmail.com
 * @Blog: https://hotaru.icu
 * @Date: 2023-06-24 15:12:55
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2023-12-03 17:37:29
 */
import {
	KotoriError,
	type EventType,
	ContextInstance,
	KotoriConfig,
	Tsu,
	type AdapterConstructor,
	type Parser,
	obj,
} from 'kotori-bot';
import Modules from './modules';
import { baseDir, globalConfig } from './global';
import loadInfo from './log';

const enum GLOBAL {
	REPO = 'https://github.com/biyuehu/kotori-bot',
}

const isDev = 'Context.options.node_env'.toString() === 'dev';

const kotoriConfig: KotoriConfig = {
	baseDir,
	config: globalConfig,
	options: {
		nodeEnv: isDev ? 'dev' : 'build',
	},
};

class Main extends ContextInstance {
	private ctx: Modules;

	public constructor() {
		Main.set(new Modules(kotoriConfig));
		super();
		this.ctx = Main.get() as Modules;
	}

	public run() {
		loadInfo(this.ctx.package, this.ctx);
		this.catchError();
		this.listenMessage();
		this.loadAllModule();
		this.checkUpdate();
	}

	private handleError(err: Error | unknown, prefix: string) {
		const isKotoriError = err instanceof KotoriError;
		if (!isKotoriError) {
			this.ctx.logger.tag(prefix, 'default', prefix === 'UCE' ? 'cyanBG' : 'greenBG').error(err);
			return;
		}
		this.ctx.logger
			.tag(err.name.split('Error')[0], 'default', 'yellow')
			[err.level === 'normal' ? 'error' : err.level](err.message, err.stack);
		if (err.name === 'CoreError') process.emit('SIGINT');
	}

	private catchError() {
		process.on('uncaughtExceptionMonitor', err => this.handleError(err, 'UCE'));
		process.on('unhandledRejection', err => this.handleError(err, 'UHR'));
		process.on('SIGINT', () => {
			process.exit();
		});
		this.ctx.logger.debug('Run info: develop with debuing...');
	}

	private listenMessage() {
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
				`Loaded ${data.moduleType} ${name} Version: ${version} ${
					Array.isArray(author) ? `Authors: ${author.join(',')}` : `Author: ${author}`
				}`,
			);
		});
		this.ctx.on('load_all_module', data => {
			this.ctx.logger.info(`Loaded ${data.count} modules (plugins)`);
			this.loadAllAdapter();
		});
	}

	private loadAllModule() {
		this.ctx.moduleAll();
		if (isDev) this.ctx.watchFile();
	}

	private loadAllAdapter() {
		const adapters = this.ctx.internal.getAdapters() as obj<[AdapterConstructor, Parser<unknown>?]>;
		Object.keys(this.ctx.config.adapter).forEach(botName => {
			const botConfig = this.ctx.config.adapter[botName];
			if (!(botConfig.extends in adapters)) {
				this.ctx.logger.warn(`Cannot find adapter '${botConfig.extends}' for ${botName}`);
				return;
			}
			const array = adapters[botConfig.extends];
			if (!array[1]?.check(botConfig)) {
				return;
			}
			const bot = new array[0](this.ctx, botConfig, botName);
			// if (!(botConfig.extend in Adapter)) Adapter.apis[botConfig.extend] = []; // I dont know whats this
			// this.ctx.botStack[botConfig.extend].push(bot.api);
			bot.start();
		}); /* 
		const adapters: Adapter[] = [];
		Object.values(this.ctx.botStack).forEach(apis => {
			apis.forEach(api => adapters.push(api.adapter));
		}); */
		// this.ctx.emit({ type: 'adapters', adapters });
	}

	private async checkUpdate() {
		const { version } = this.ctx.package;
		const res = await this.ctx.http
			.get(
				'https://hotaru.icu/api/agent/?url=https://raw.githubusercontent.com/BIYUEHU/kotori-bot/master/packages/kotori/package.json',
			)
			.catch(() => this.ctx.logger.error('Get update failed, please check your network'));
		if (!res || !Tsu.Object({ version: Tsu.String() }).check(res)) {
			this.ctx.logger.error(`Detection update failed`);
		} else if (version === res.version) {
			this.ctx.logger.log('Kotori is currently the latest version');
		} else {
			this.ctx.logger.warn(
				`The current version of Kotori is ${version}, and the latest version is ${res.version}. Please go to ${GLOBAL.REPO} to update`,
			);
		}
	}
}

export default Main;
