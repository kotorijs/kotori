import Logger from '@kotori-bot/logger';
import Locale from '@kotori-bot/i18n';
import Message from './message';

export const MixedBefore = Object.assign(Message, new Locale('en_US'), { logger: new Logger() });

export class Content extends MixedBefore {}

export default Content;
