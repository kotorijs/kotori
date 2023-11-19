import Kotori, { isObj } from 'kotori-bot';
import { resolve } from 'path';

Kotori.uselang(resolve(__dirname, '../locales'));

Kotori.command('github <repository> - querytool.descr.github').action(async data => {
	const res = await Kotori.http.get(`https://api.github.com/repos/${data.args[0]}`);
	if (!isObj(res)) return ['BOT_RESULT.SERVER_ERROR', { res }];
	if (!res.full_name) return ['querytool.msg.github.fail', { input: data.args[0] }];
	data.quick([
		'querytool.msg.github',
		{
			name: res.full_name || 'BOT_RESULT.EMPTY',
			description: res.description || 'BOT_RESULT.EMPTY',
			language: res.language || 'BOT_RESULT.EMPTY',
			author: res.owner ? res.owner.login || 'BOT_RESULT.EMPTY' : 'BOT_RESULT.EMPTY',
			create: res.created_at || 'BOT_RESULT.EMPTY',
			update: res.updated_at || 'BOT_RESULT.EMPTY',
			push: res.pushed_at || 'BOT_RESULT.EMPTY',
			license: res.license ? res.license.name || 'BOT_RESULT.EMPTY' : 'BOT_RESULT.EMPTY',
		},
	]);
	return `[CQ:image,file=https://opengraph.githubassets.com/c9f4179f4d560950b2355c82aa2b7750bffd945744f9b8ea3f93cc24779745a0/${res.full_name}]`;
});
