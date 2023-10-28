import Mixed from './mixed';

export * from './adapter';
export * from './api';
export * from './events';
export * from './message';
export * from './mixed';
export * from './errror';
export * from './global';
export * from '@kotori-bot/tools';

export type Content = keyof typeof Mixed;

export namespace Kotori {
	/* Core Class */
	export const { configs, baseDir } = Mixed;

	/* Events Class */
	export const { on, once, off, offAll, emit } = Mixed;

	/* Modules Class */
	export const { module, delcache } = Mixed;

	/* Message Class */
	export const { midware, command, regexp, boardcasst, notify } = Mixed;

	/* Locale Module */
	export const { locale, uselang, setlang } = Mixed;

	/* Logger Module */
	export const { logger } = Mixed;

	/* Fetch */
	export const { http } = Mixed;
}

export default Kotori;
