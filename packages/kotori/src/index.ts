import { none } from '@kotori-bot/tools';
import Context from './context';

export * from './components/adapter';
export * from './components/api';
export * from './context';
export * from './utils/errror';
export * from './types';
export * from '@kotori-bot/tools';
export * from 'tsukiko';

export class ContextInstance {
	protected constructor() {
		none();
	}

	private static instance: Context = {} as Context;

	protected static setInstance(ctx: Context) {
		this.instance = ctx;
	}

	public static getInstance() {
		return this.instance;
	}

	public static getMixin() {
		return Object.assign(ContextInstance.getInstance() /* , Context */);
	}
}
// const ctx = ContextInstance.get();

// namespace KotoriSpace {
// 	/* Core Class */
// 	export const { Config, baseDir } = ctx;

// 	/* Events Class */
// 	export const { on, once, off, offAll, emit } = ctx;

// 	/* Modules Class */
// 	export const { module, delcache } = ctx;

// 	/* Message Class */
// 	export const { midware, command, regexp, boardcast, notify } = ctx;

// 	/* Locale Module */
// 	export const { locale, uselang, setlang } = ctx;

// 	/* Logger Module */
// 	export const { logger } = ctx;

// 	/* Fetch */
// 	export const { http } = ctx;
// }

export const Kotori: typeof Context & Context = new Proxy(ContextInstance.getMixin(), {
	get: (_, prop) => {
		const target = ContextInstance.getMixin();
		if (prop === undefined) return target;
		return target[prop as keyof typeof target];
	},
});

export default Kotori;