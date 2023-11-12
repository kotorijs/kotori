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
	.alias('print')
	.scope('group');

Kotori.regexp(/(.*)#print/, (_, match) => match[1]);

Kotori.command('ison').action((_, events) => {
	if (events.api.adapter.config.master === events.userId) return `${events.api.adapter.nickname}在的哟主人~`;
	return '你是...谁?';
});
