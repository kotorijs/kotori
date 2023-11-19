import Logger from '@kotori-bot/logger';
import Locale from '@kotori-bot/i18n';
import { Http } from '@kotori-bot/tools';
import Message from './message';
import { KotoriConfigs } from './types';
import Command from './command';

export class Context extends Message {
	public readonly http = new Http({ validateStatus: () => true });

	public readonly logger = Logger;

	public readonly uselang;

	public readonly setlang;

	public readonly locale;

	public readonly commandList = Command.commandDataStack;

	public constructor(configs?: KotoriConfigs) {
		super(configs);
		const { uselang, setlang, locale } = new Locale(this.configs.global.lang);
		this.uselang = uselang;
		this.setlang = setlang;
		this.locale = locale;
		this.initialize();
	}

	private readonly initialize = () => {
		this.registeMessageEvent();
		this.midware((data, next) => {
			const selfId = data.api.adapter.selfId;
			if (data.userId !== selfId) next();
		}, 50);
	};
}

/* export declare namespace JSX {
	interface IntrinsicElements {
		render: any;
	}
} */

export default Context;
