import Kotori from 'kotori-bot';

Kotori.command('echo <content> [num:number=3]')
	.action((data, message) => {
		Kotori.logger.debug(data, data.args[0]);
		Kotori.logger.debug(message);
		return [
			`返回消息:~%message%`,
			{
				message: data.args[0],
			},
		];
	})
	.alias('print');
