/*
 * @Author: hotaru biyuehuya@gmail.com
 * @Blog: https://hotaru.icu
 * @Date: 2023-07-11 14:18:27
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2024-02-04 19:48:44
 */

import { Context, SessionData, MessageQuick, ModuleConfig, Tsu } from 'kotori-bot';

export const config = Tsu.Object({
  alias: Tsu.String().optional(),
  keywords: Tsu.Array(Tsu.String()).default(['菜单', '功能']),
  content: Tsu.String()
});

export const lang = [__dirname, '../locales'];

export function main(ctx: Context, conf: Tsu.infer<typeof config> & ModuleConfig) {
  const handle = (session: SessionData): MessageQuick => [conf.content, { at: session.el.at(session.userId) }];

  const cmd = ctx.command('menu - menu.descr.menu').action((_, session) => handle(session));
  if (conf.alias) cmd.alias(conf.alias);

  conf.keywords.forEach((element) => {
    ctx.regexp(new RegExp(element), (_, session) => handle(session));
  });
}
