import Kotori from 'kotori-bot';
import config from './config';
import Translate from './translate';

/* change rest args */
Kotori.command(`抽象 [${config.arg}] - ${config.help}`).action(data => {
	if (!data.args[0]) return config.fail;
	const demo = new Translate(data.args[0] as string);
	if (!demo.result) return config.fail;
	return [config.info, { content: demo.result, score: demo.score }];
});
