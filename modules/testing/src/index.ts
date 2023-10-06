import Kotori from '@kotori-bot/kotori';

Kotori.command('echo <content>').action(data => {
	console.log(data);
});
