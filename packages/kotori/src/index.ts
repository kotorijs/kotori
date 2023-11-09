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

	private static instance: Content = {} as Content;

	protected static readonly setInstance = (Ctx: Content) => {
		this.instance = Ctx;
	};

	public static readonly getInstance = (): Content => Object.create(this.instance);

	public static readonly getInstanceMixin = () => Object.assign(ContentInstance.getInstance(), Content);
}

// const ctx = ContentInstance.getInstance();

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

export const Kotori: typeof Content & Content = new Proxy(ContentInstance.getInstanceMixin(), {
	get: (_, prop) => {
		const target = ContentInstance.getInstanceMixin();
		if (prop === undefined) return target;
		return target[prop as keyof typeof target];
	},
});

export default Kotori;
