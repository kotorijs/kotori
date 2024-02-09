/*
 * @Author: hotaru biyuehuya@gmail.com
 * @Blog: https://hotaru.icu
 * @Date: 2023-07-11 14:18:27
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2024-02-09 21:33:48
 */

import { Context, Symbols } from 'kotori-bot';

export const lang = [__dirname, '../locales'];

export function main(ctx: Context) {
  ctx.command('core - core.descr.core').action((_, session) => {
    const { config, baseDir, options } = session.api.adapter.ctx;
    let botsLength = 0;
    ctx[Symbols.bot].forEach((bots) =>
      bots.forEach(() => {
        botsLength += 1;
      })
    );
    return [
      'core.msg.core',
      {
        lang: config.global.lang,
        root: baseDir.root,
        mode: options.mode,
        modules: ctx[Symbols.modules] ? ctx[Symbols.modules]!.size : 0,
        services: ctx[Symbols.adapter].size,
        bots: botsLength,
        midwares: ctx[Symbols.midware].size,
        commands: ctx[Symbols.command].size,
        regexps: ctx[Symbols.regexp].size
      }
    ];
  });

  ctx.command('bot - core.descr.bot').action((_, session) => {
    const { identity, platform, selfId, config, status } = session.api.adapter;
    return [
      'core.msg.bot',
      {
        identity,
        lang: config.lang,
        platform,
        self_id: selfId,
        create_time: session.i18n.time(status.createTime),
        last_msg_time: status.lastMsgTime ? session.i18n.time(status.lastMsgTime) : '',
        received_msg: status.receivedMsg,
        sent_msg: status.sentMsg,
        offline_times: status.offlineTimes
      }
    ];
  });

  ctx.command('bots - core.descr.bots').action((_, session) => {
    let list = '';
    ctx[Symbols.bot].forEach((bots) =>
      bots.forEach((bot) => {
        const { identity, platform, config, status } = bot.adapter;
        list += session.format('core.msg.bots.list', {
          identity,
          lang: config.lang,
          platform,
          status: status.value
        });
      })
    );
    return ['core.msg.bots', { list }];
  });

  ctx.command('about - core.descr.about').action((_, session) => {
    const { version, license } = session.api.adapter.ctx.pkg;
    return ['core.msg.about', { version, license, node_version: process.version }];
  });
}
