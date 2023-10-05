import Logger from '@kotori-bot/logger';
import Locale from '@kotori-bot/i18n';
import Message from './message';

export const Mixed = Object.assign(Message, new Locale('en_US'), { logger: Logger });

export declare namespace JSX {
	interface IntrinsicElements {
		render: any;
	}
}

export default Mixed;
