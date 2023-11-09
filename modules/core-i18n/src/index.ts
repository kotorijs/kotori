import Kotori, { CommandResult, MessageRaw, StringTempArgs, stringTemp } from 'kotori-bot';
import { resolve } from 'path';

Kotori.uselang(resolve(__dirname, '../locales'));

Kotori.on('command', data => {
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
		default:
			quick('corei18n.template.unknown', {
				code: data.result,
			});
	}
});
