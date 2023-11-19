import Kotori from '@kotori-bot/kotori';
import config from './config';
import Translate from './translate';

/* change rest args */
Kotori.command('nmsl [content]')
	.action(data => {
		const demo = new Translate(data.args[0] as string);
		if (!demo.result) return config.fail;
		return [config.info, { content: demo.result }];
	})
	.help(config.help);
