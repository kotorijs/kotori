import Kotori, { Tsu } from 'kotori-bot';
import { resolve } from 'path';

const githubSchema = Tsu.Union([
	Tsu.Object({
		full_name: Tsu.String(),
		description: Tsu.String().default('corei18n.template.empty'),
		language: Tsu.String().default('corei18n.template.empty'),
		owner: Tsu.Object({ login: Tsu.String().default('corei18n.template.empty') }).default({
			login: 'corei18n.template.empty',
		}),
		created_at: Tsu.String(),
		updated_at: Tsu.String(),
		pushed_at: Tsu.String(),
		license: Tsu.Object({ name: Tsu.String().default('corei18n.template.empty') }).default({
			name: 'corei18n.template.empty',
		}),
	}),
	Tsu.Object({}),
]);

Kotori.uselang(resolve(__dirname, '../locales'));

Kotori.command('github <repository> - querytool.descr.github').action(async (data, session) => {
	const res = githubSchema.parse(await Kotori.http.get(`https://api.github.com/repos/${data.args[0]}`));
	if (!('full_name' in res)) return ['querytool.msg.github.fail', { input: data.args[0] }];
	session.quick([
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
	return session.el.image(
		`https://opengraph.githubassets.com/c9f4179f4d560950b2355c82aa2b7750bffd945744f9b8ea3f93cc24779745a0/${res.full_name}`,
	);
});