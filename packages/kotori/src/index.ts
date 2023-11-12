import { none } from '@kotori-bot/tools';
import Context from './context';

export * from './adapter';
export * from './api';
export * from './context';
export * from './errror';
export * from './types';
export * from '@kotori-bot/tools';

export class ContextInstance {
	protected constructor() {
		none();
	}

	private static instance: Context = {} as Context;

	protected static readonly setInstance = (Ctx: Context) => {
		this.instance = Ctx;
	};

	public static readonly getInstance = (): Context => Object.create(this.instance);

	public static readonly getInstanceMixin = () => Object.assign(ContextInstance.getInstance(), Context);
}

// const ctx = ContextInstance.getInstance();

// namespace KotoriSpace {
// 	/* Core Class */
// 	export const { configs, baseDir } = ctx;

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

export const Kotori: typeof Context & Context = new Proxy(ContextInstance.getInstanceMixin(), {
	get: (_, prop) => {
		const target = ContextInstance.getInstanceMixin();
		if (prop === undefined) return target;
		return target[prop as keyof typeof target];
	},
});

export default Kotori;
