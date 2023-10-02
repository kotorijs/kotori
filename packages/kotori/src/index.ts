import Mixed from './content';

export * from './adapter';
export * from './api';
export * from './events';
export * from './message';
export * from '@kotori-bot/tools';

export type Content = keyof typeof Mixed;

export namespace Kotori {
	/* Events Class */
	export const { on, once, off, offAll } = Mixed;

	/* Modules Class */
	export const { module, delcache } = Mixed;

	/* Message Class */
	export const { midware, command, regexp, boardcasst, notify } = Mixed;

	/* Locale Module */
	export const { locale, uselang, setlang } = Mixed;

	/* Logger Module */
	export const { logger } = Mixed;
}

export default Kotori;
