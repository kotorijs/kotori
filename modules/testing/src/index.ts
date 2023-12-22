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

Kotori.regexp(/^(.*)#print$/, match => match[1]);

Kotori.command('ison').action((_, events) => {
	if (events.api.adapter.config.master === events.userId) return `在的哟主人~`;
	return '你是...谁?';
});


Kotori.on('poke', session => {
	if (session.api.adapter.platform !== 'onebot') return '';
	if (session.userId === session.api.adapter.selfId || session.targetId !== session.api.adapter.selfId) return '';
	/* session.api.extra.poke(session.userId); */
	session.send(`[CQ:poke,qq=${session.userId}]`)
	return '戳回去！！';
});

