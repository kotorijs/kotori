import { none } from '@kotori-bot/tools';
import Content from './content';

export * from './adapter';
export * from './api';
export * from './content';
export * from './errror';
export * from './types';
export * from '@kotori-bot/tools';

export class ContentInstance {
	protected constructor() {
		none();
	}

	protected static instance: Content;

	public static readonly getInstance = () => this.instance;
}

const Ctx = ContentInstance.getInstance();

export namespace Kotori {
	/* Core Class */
	export const { configs, baseDir } = Ctx;

	/* Events Class */
	export const { on, once, off, offAll, emit } = Ctx;

	/* Modules Class */
	export const { module, delcache } = Ctx;

	/* Message Class */
	export const { midware, command, regexp, boardcasst, notify } = Ctx;

	/* Locale Module */
	export const { locale, uselang, setlang } = Ctx;

	/* Logger Module */
	export const { logger } = Ctx;

	/* Fetch */
	export const { http } = Ctx;
}

export default Kotori;
