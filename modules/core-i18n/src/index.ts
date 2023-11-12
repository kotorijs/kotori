import { CommandResult, Context, MessageRaw, StringTempArgs, stringTemp } from 'kotori-bot';
import { resolve } from 'path';

export function main(ctx: Context) {
	ctx.uselang(resolve(__dirname, '../locales'));

	ctx.on('command', data => {
		if (data.result === CommandResult.SUCCESS) return;
		data.cancel();
		const quick = (message: MessageRaw, params?: StringTempArgs) =>
			data.messageData.send(stringTemp(data.messageData.locale(message), params || {}));
		switch (data.result) {
			case CommandResult.ARG_ERROR:
				quick('corei18n.template.args_error');
				break;
			case CommandResult.FEW_ARG:
				quick('corei18n.template.args_few');
				break;
			case CommandResult.MANY_ARG:
				quick('corei18n.template.args_many');
				break;
			case CommandResult.OPTION_ERROR:
				quick('corei18n.template.option_error');
				break;
			case CommandResult.SYNTAX:
				quick('corei18n.template.syntax');
				break;
			case CommandResult.UNKNOWN:
				quick('corei18n.template.unknown');
				break;
			default:
				quick('corei18n.template.error', {
					code: data.result,
				});
		}
	});
}

export default main;
