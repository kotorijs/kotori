/*
 * @Author: hotaru biyuehuya@gmail.com
 * @Blog: https://hotaru.icu
 * @Date: 2023-07-11 14:18:27
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2024-06-05 17:25:10
 */

import { CommandAccess, CommandError, Context, MessageScope, TsuError, LocaleType, Symbols } from 'kotori-bot';

export const lang = [__dirname, '../locales'];

export function main(ctx: Context) {
  ctx.on('parse', (data) => {
    const { quick } = data.session;
    if (!(data.result instanceof CommandError)) {
      const { scope, access } = data.command.meta;
      if (scope && scope !== 'all' && data.session.type !== scope) {
        quick('corei18n.template.scope');
        data.cancel();
      } else if (data.session.userId !== data.session.api.adapter.config.master) {
        if (access === CommandAccess.ADMIN) {
          quick('corei18n.template.no_access_admin');
          data.cancel();
        } else if (
          access === CommandAccess.MANGER &&
          (data.session.type === MessageScope.PRIVATE || data.session.sender.role === 'member')
        ) {
          quick('corei18n.template.no_access_manger');
          data.cancel();
        }
      }
      return;
    }
    data.cancel();
    const { value } = data.result;
    switch (value.type) {
      case 'arg_error':
        quick(['corei18n.template.args_error', [value.index, value.expected, value.reality]]);
        break;
      case 'arg_few':
        quick(['corei18n.template.args_few', [value.expected, value.reality]]);
        break;
      case 'arg_many':
        quick(['corei18n.template.args_many', [value.expected, value.reality]]);
        break;
      case 'option_error':
        quick(['corei18n.template.option_error', [value.target, value.expected, value.reality]]);
        break;
      case 'syntax':
        quick(['corei18n.template.syntax', [value.index, value.char]]);
        break;
      case 'unknown':
        quick(['corei18n.template.unknown', [value.input]]);
        break;
      default:
    }
  });

  ctx.on('command', (data) => {
    if (!(data.result instanceof CommandError)) return;
    const { value } = data.result;
    const { quick } = data.session;
    switch (value.type) {
      case 'res_error':
        quick(['corei18n.template.res_error', [value.error.message]]);
        break;
      case 'num_error':
        quick('corei18n.template.num_error');
        break;
      case 'no_access_manger':
        quick('corei18n.template.no_access_manger');
        break;
      case 'no_access_admin':
        quick('corei18n.template.no_access_admin');
        break;
      case 'disable':
        quick('corei18n.template.disable');
        break;
      case 'exists':
        quick(['corei18n.template.exists', [value.target]]);
        break;
      case 'no_exists':
        quick(['corei18n.template.no_exists', [value.target]]);
        break;
      case 'error':
        ctx.logger.error(value.error);
        if (value.error instanceof TsuError) {
          quick(['corei18n.template.res_error', [value.error.message]]);
          return;
        }
        if (value.error instanceof Error) {
          quick(['corei18n.template.error', [`${value.error.name} ${value.error.message}`]]);
          return;
        }
        if (typeof value.error === 'object') {
          quick(['corei18n.template.error', [JSON.stringify(value.error)]]);
          return;
        }
        quick(['corei18n.template.error', [String(value.error)]]);
        break;
      case 'data_error':
        quick([
          `corei18n.template.data_error.${typeof value.target === 'string' ? 'options' : 'args'}`,
          [value.target]
        ]);
        break;
      default:
    }
  });

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

  ctx
    .command('locale <lang> - core.descr.locale')
    .option('G', 'global:boolean - core.option.locale.global')
    .action(({ args: [lang], options: { global } }, session) => {
      const { adapter } = session.api;
      if (!['en_US', 'ja_JP', 'zh_CN', 'zh_TW'].includes(lang)) return 'core.msg.locale.invalid';
      if (global) {
        adapter.ctx.root.config.global.lang = lang as LocaleType;
        adapter.ctx[Symbols.bot].forEach((apis) =>
          apis.forEach((api) => {
            const { adapter } = api;
            adapter.config.lang = lang as LocaleType;
          })
        );
      } else {
        adapter.config.lang = lang as LocaleType;
      }
      return session.quick([`core.msg.locale${global ? '.global' : ''}`, { lang }]);
    });

  ctx.command('module - core.descr.module').action((_, session) => {
    let list = '';
    ctx[Symbols.modules].forEach(([{ pkg }]) => {
      list += session.format('core.msg.module.list', {
        name: pkg.name,
        version: pkg.version,
        description: pkg.description
      });
    });
    return ['core.msg.module', { list }];
  });
}
