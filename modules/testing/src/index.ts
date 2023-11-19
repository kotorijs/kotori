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

Kotori.regexp(/^(.*)#print$/, (_, match) => match[1]);

Kotori.command('ison').action((_, events) => {
	if (events.api.adapter.config.master === events.userId) return `${events.api.adapter.nickname}在的哟主人~`;
	return '你是...谁?';
});

Kotori.regexp(/^\[CQ:poke,qq=(.*)\]$/, (data, match) => {
	if (!data.groupId) return ';';
	if (data.userId === data.api.adapter.selfId || parseInt(match[1], 10) !== data.api.adapter.selfId) return '';
	data.send(`[CQ:poke,qq=${data.userId}]`);
	console.log(data, match);
	return '戳回去！！';
});
