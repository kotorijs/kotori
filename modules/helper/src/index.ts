/*
 * @Author: hotaru biyuehuya@gmail.com
 * @Blog: https://hotaru.icu
 * @Date: 2023-07-11 14:18:27
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2023-11-18 18:45:08
 */

import Kotori, { stringProcess, stringTemp } from '@kotori-bot/kotori';
import { resolve } from 'path';

Kotori.uselang(resolve(__dirname, '../locales'));

/* rest paramter */
Kotori.command('help [command] - helper.descr.help').action((data, events) => {
	const filterResult = data.args[0]
		? events.api.adapter.ctx.commandStack.filter(
				command =>
					stringProcess(data.args[0], command.data.root) ||
					command.data.alias.filter(alias => stringProcess(data.args[0], alias)).length > 0,
		  )
		: events.api.adapter.ctx.commandStack;
	if (filterResult.length <= 0) return 'helper.msg.descr.fail';
	console.log(filterResult);
	let commands = '';
	const temp: typeof stringTemp = (template, args) => stringTemp(events.locale(template), args);

	filterResult.forEach(command => {
		const cmd = command.data;
		const alias =
			cmd.alias.length > 0
				? temp('helper.template.alias', {
						content: cmd.alias.join(events.locale('helper.template.alias.delimiter')),
				  })
				: '';
		let args = '';
		let options = '';
		cmd.args.forEach(arg => {
			let defaultValue = '';
			if ('default' in arg) {
				const valueType = typeof arg.default;
				if (valueType === 'string' || valueType === 'number') {
					defaultValue = temp('helper.template.default', { content: arg.default });
				}
			}
			args += temp(`helper.template.arg.${arg.optional ? 'optional' : 'required'}`, {
				name: arg.name,
				type: arg.type === 'string' ? '' : temp('helper.template.arg.type', { content: arg.type }),
				default: defaultValue,
			});
		});
		cmd.options.forEach(option => {
			let defaultValue = '';
			if ('default' in option) {
				const valueType = typeof option.default;
				if (valueType === 'string' || valueType === 'number') {
					defaultValue = temp('helper.template.default', { content: option.default });
				}
			}
			options += temp('helper.template.option', {
				name: option.realname,
				type: option.type === 'string' ? '' : temp('helper.template.option.type', { content: option.type }),
				default: defaultValue,

				description: option.description
					? temp('helper.template.description', { content: events.locale(option.description) })
					: '',
			});
		});
		if (cmd.options.length > 0) options = temp('helper.template.options', { content: options });

		commands += temp('helper.msg.descr.command', {
			root: `${events.api.adapter.config['command-prefix']}${cmd.root}`,
			args,
			description: cmd.description ? temp('helper.template.description', { content: events.locale(cmd.description) }) : '',
			options,
			help: cmd.help ? temp('helper.template.help', { content: events.locale(cmd.help) }) : '',
			alias,
		});
	});
	return ['helper.msg.help', { content: commands }];
});
