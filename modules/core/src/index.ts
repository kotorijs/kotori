/*
 * @Author: hotaru biyuehuya@gmail.com
 * @Blog: https://hotaru.icu
 * @Date: 2023-07-11 14:18:27
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2024-02-06 20:01:48
 */

import { Context, Symbols, formatTime, stringTemp } from 'kotori-bot';

export const lang = [__dirname, '../locales'];

export function main(ctx: Context) {
  ctx.command('core - core.descr.core').action((_, events) => {
    const { config, baseDir, options } = events.api.adapter.ctx;
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

  ctx.command('bot - core.descr.bot').action((_, events) => {
    const { identity, platform, selfId, config, status } = events.api.adapter;
    return [
      'core.msg.bot',
      {
        identity,
        lang: config.lang,
        platform,
        self_id: selfId,
        create_time: formatTime(status.createTime),
        last_msg_time: formatTime(status.lastMsgTime),
        received_msg: status.receivedMsg,
        sent_msg: status.sentMsg,
        offline_times: status.offlineTimes
      }
    ];
  });

  ctx.command('bots - core.descr.bots').action((_, events) => {
    let list = '';
    ctx[Symbols.bot].forEach((bots) =>
      bots.forEach((bot) => {
        const { identity, platform, config, status } = bot.adapter;
        list += stringTemp(events.i18n.locale('core.msg.bots.list'), {
          identity,
          lang: config.lang,
          platform,
          status: status.value
        });
      })
    );
    return ['core.msg.bots', { list }];
  });

  ctx.command('about - core.descr.about').action((_, events) => {
    const { version, license } = events.api.adapter.ctx.pkg;
    return ['core.msg.about', { version, license, node_version: process.version }];
  });
}
