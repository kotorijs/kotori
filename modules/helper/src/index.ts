/*
 * @Author: hotaru biyuehuya@gmail.com
 * @Blog: https://hotaru.icu
 * @Date: 2023-07-11 14:18:27
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2023-12-03 16:50:16
 */

import { Context, stringTemp } from 'kotori-bot';
import { resolve } from 'path';

export function main(ctx: Context) {
	ctx.uselang(resolve(__dirname, '../locales'));

	/* rest paramter */
	ctx.command('help [command] - helper.descr.help').action((data, events) => {
		const commandStack = ctx.internal.getCommands();
		const filterResult = data.args[0]
			? commandStack.filter(
					command =>
						(data.args[0] as string).startsWith(command.data.root) ||
						command.data.alias.filter(alias => (data.args[0] as string).startsWith(alias)).length > 0,
			  )
			: commandStack;
		if (filterResult.length <= 0) return 'helper.msg.descr.fail';
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
				description: cmd.description
					? temp('helper.template.description', { content: events.locale(cmd.description) })
					: '',
				options,
				help: cmd.help ? temp('helper.template.help', { content: events.locale(cmd.help) }) : '',
				alias,
			});
		});
		return ['helper.msg.help', { content: commands }];
	});
}

export default main;
