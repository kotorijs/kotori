/*
 * @Author: hotaru biyuehuya@gmail.com
 * @Blog: https://hotaru.icu
 * @Date: 2023-07-11 14:18:27
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2023-12-24 22:23:59
 */

import Kotori, { Tsu, formatTime, stringTemp } from 'kotori-bot';
import { resolve } from 'path';

Kotori.i18n.use(resolve(__dirname, '../locales'));

Kotori.command('core - core.descr.core').action((_, events) => {
  const { config, baseDir, options, internal } = events.api.adapter.ctx;
  let botsLength = 0;
  Object.values(internal.getBots()).forEach(bots =>
    bots.forEach(() => {
      botsLength += 1;
    }),
  );
  return [
    'core.msg.core',
    {
      lang: config.global.lang,
      root: baseDir.root,
      mode: options.env,
      modules: internal.getModules().length,
      adapters: Object.values(internal.getAdapters()).length,
      bots: botsLength,
      midwares: internal.getMidwares().length,
      commands: internal.getCommands().length,
      regexps: internal.getRegexps().length,
    },
  ];
});

Kotori.command('bot - core.descr.bot').action((_, events) => {
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
      offline_times: status.offlineTimes,
    },
  ];
});

Kotori.command('bots - core.descr.bots').action((_, events) => {
  let list = '';
  Object.values(events.api.adapter.ctx.internal.getBots()).forEach(bots =>
    bots.forEach(bot => {
      const { identity, platform, config, status } = bot.adapter;
      list += stringTemp(events.locale('core.msg.bots.list'), {
        identity,
        lang: config.lang,
        platform,
        status: status.value,
      });
    }),
  );
  return ['core.msg.bots', { list }];
});

Kotori.command('version - core.descr.version').action((_, events) => {
  const { version, license } = events.api.adapter.ctx.package;
  return ['core.msg.version', { version, license, node_version: process.version }];
});

Kotori.command('about - core.descr.about').action(() => 'core.msg.about');

Kotori.command('update - core.descr.update').action(async (_, events) => {
  const { version } = events.api.adapter.ctx.package;
  let content: string;
  const res = await Kotori.http.get(
    'https://hotaru.icu/api/agent/?url=https://raw.githubusercontent.com/kotorijs/kotori/master/packages/kotori/package.json',
  );
  if (!res || !Tsu.Object({ version: Tsu.String() }).check(res)) {
    content = events.locale('core.msg.update.fail');
  } else if (version === res.version) {
    content = events.locale('core.msg.update.yes');
  } else {
    content = stringTemp(events.locale('core.msg.update.fail'), {
      repo: 'https://github.com/kotorijs/kotori',
    });
  }
  return ['core.msg.update', { version, content }];
});
