/*
 * @Author: hotaru biyuehuya@gmail.com
 * @Blog: https://hotaru.icu
 * @Date: 2023-07-11 14:18:27
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2023-12-17 16:07:04
 */

import { Context, EventDataMsg, MessageQuick, Tsu } from 'kotori-bot';
import { resolve } from 'path';

export const config = Tsu.Object({
	alias: Tsu.String().optional(),
	keywords: Tsu.Array(Tsu.String()).default(['菜单', '功能']),
	content: Tsu.String(),
});

export function main(ctx: Context, conf: Tsu.infer<typeof config>) {
	ctx.uselang(resolve(__dirname, '../locales'));

	const handle = (session: EventDataMsg): MessageQuick => [conf.content, { at: session.el.at(session.userId) }];

	const cmd = ctx.command('menu - menu.descr.menu').action((_, session) => handle(session));
	if (conf.alias) cmd.alias(conf.alias);

	conf.keywords.forEach(element => {
		ctx.regexp(new RegExp(element), (_, session) => handle(session));
	});
}

export default main;
