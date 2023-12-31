import { Context, ContextInstance } from '@kotori-bot/core';

export * from '@kotori-bot/core';

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
