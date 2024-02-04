/*
 * @Author: hotaru biyuehuya@gmail.com
 * @Blog: https://hotaru.icu
 * @Date: 2023-07-11 14:18:27
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2024-02-04 20:15:37
 */

import { Command, Context, Symbols, stringTemp } from 'kotori-bot';

export const lang = [__dirname, '../locales'];

export function main(ctx: Context) {
  ctx.command('help [...command] - helper.descr.help').action((data, events) => {
    const filterResult: Command['meta'][] = [];
    const args = (data.args as string[]).join('');
    ctx[Symbols.command].forEach((command) => {
      if (
        !args ||
        args.startsWith(command.meta.root) ||
        command.meta.alias.filter((alias) => args.startsWith(alias)).length > 0
      ) {
        filterResult.push(command.meta);
      }
    });
    if (filterResult.length <= 0) return 'helper.msg.descr.fail';
    let commands = '';
    const temp: typeof stringTemp = (template, args) => stringTemp(events.i18n.locale(template), args);
    filterResult.forEach((command) => {
      const cmd = command;
      const alias =
        cmd.alias.length > 0
          ? temp('helper.template.alias', {
              content: cmd.alias.join(events.i18n.locale('helper.template.alias.delimiter'))
            })
          : '';
      let args = '';
      let options = '';
      const handle = (values: Command['meta']['args'] | Command['meta']['options']) => {
        values.forEach((value) => {
          let defaultValue = '';
          if ('rest' in value) {
            const valueType = typeof value.default;
            if (valueType === 'string' || valueType === 'number') {
              defaultValue = temp('helper.template.default', { content: value.default as string });
            } else if (valueType === 'boolean') {
              defaultValue = temp('helper.template.default', { content: value.default ? 'true' : 'false' });
            }
            args += temp(`helper.template.arg.${value.optional ? 'optional' : 'required'}`, {
              name: value.rest ? `...${value.name}` : value.name,
              type: value.type === 'string' ? '' : temp('helper.template.arg.type', { content: value.type }),
              default: defaultValue
            });
          }
          if (!('realname' in value) || !('description' in value)) return;
          options += temp('helper.template.option', {
            name: value.name,
            realname: value.realname,
            type: value.type === 'string' ? '' : temp('helper.template.arg.type', { content: value.type }),
            description: value.description
              ? temp('helper.template.description', { content: events.i18n.locale(value.description) })
              : ''
          });
        });
      };
      handle(command.args);
      handle(command.options);
      if (options) options = temp('helper.template.options', { content: options });
      commands += temp('helper.msg.descr.command', {
        root: `${events.api.adapter.config['command-prefix']}${cmd.root}`,
        args,
        description: cmd.description
          ? temp('helper.template.description', { content: events.i18n.locale(cmd.description) })
          : '',
        options,
        help: cmd.help ? temp('helper.template.help', { content: events.i18n.locale(cmd.help) }) : '',
        alias
      });
    });
    return ['helper.msg.help', { content: commands }];
  });
}

export default main;
