import Logger from '@kotori-bot/logger';
import { Http } from '@kotori-bot/tools';
import Locale from './utils/i18n';
import Internal from './core/internal';
import { KotoriConfig } from './types';

export class Context extends Internal {
	public readonly http = new Http({ validateStatus: () => true });

	public readonly logger = Object.assign(
		Logger,
		new Proxy(Logger.debug, {
			apply: (target, _, argArray) => {
				if (this.options.nodeEnv === 'dev') target(argArray);
			},
		}),
	);

	public readonly uselang: Locale['use'];

	public readonly setlang: Locale['set'];

	public readonly locale: Locale['locale'];

	private initialize() {
		this.registeMessageEvent();
		this.midware((next, session) => {
			const { selfId } = session.api.adapter;
			if (session.userId !== selfId) next();
		}, 50);
	}

	public constructor(Config?: KotoriConfig) {
		super(Config);
		const locale = new Locale(this.config.global.lang);
		this.uselang = data => locale.use(data);
		this.setlang = lang => locale.set(lang);
		this.locale = (val, type?) => locale.locale(val, type);
		this.initialize();
	}
}

export default Context;
