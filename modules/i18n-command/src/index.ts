import { Context } from 'kotori-bot';
import { resolve } from 'path';

declare module 'kotori-bot' {
	interface CommandResult {
		res_error: { res: unknown };
		num_error: object;
		num_choose: object;
		no_access_manger: object;
		no_access_admin: object;
		disable: object;
		exists: { target: string };
		no_exists: CommandResult['exists'];
		error: { error: unknown };
	}
}

export function main(ctx: Context) {
	ctx.uselang(resolve(__dirname, '../locales'));

	ctx.on('parse', session => {
		const { result } = session;
		if (result.type === 'parsed') return;
		session.cancel();
		const { quick } = session.event;
		switch (result.type) {
			case 'arg_error':
				quick(['corei18n.template.args_error', result]);
				break;
			case 'arg_few':
				quick(['corei18n.template.args_few', result]);
				break;
			case 'arg_many':
				quick(['corei18n.template.args_many', result]);
				break;
			case 'option_error':
				quick(['corei18n.template.option_error', result]);
				break;
			case 'syntax':
				quick(['corei18n.template.syntax', result]);
				break;
			case 'unknown':
				quick(['corei18n.template.unknown', result]);
				break;
			default:
		}
	});

	ctx.on('command', session => {
		const { result } = session;
		if (result.type === 'success') return;
		const { quick } = session.event;
		switch (result.type) {
			case 'res_error':
				quick([
					'corei18n.template.res_error',
					{
						content: typeof result.res === 'object' ? JSON.stringify(result.res) : (result.res as string),
					},
				]);
				break;
			case 'num_error':
				quick(['corei18n.template.num_error', result]);
				break;
			case 'no_access_manger':
				quick('corei18n.template.no_access_manger');
				break;
			case 'no_access_admin':
				quick('corei18n.template.no_access_admin');
				break;
			case 'num_choose':
				quick('corei18n.template.num_choose');
				break;
			case 'disable':
				quick('corei18n.template.disable');
				break;
			case 'exists':
				quick(['corei18n.template.exists', result]);
				break;
			case 'no_exists':
				quick(['corei18n.template.no_exists', result]);
				break;
			case 'error':
				if (result.error instanceof Error) {
					quick(['corei18n.template.error', { error: `${result.error.name} ${result.error.message}` }]);
					return;
				}
				if (typeof result.error === 'object') {
					quick(['corei18n.template.error', { error: JSON.stringify(result.error) }]);
					return;
				}
				quick(['corei18n.template.error', { error: result.error as string }]);
				break;
			default:
		}
	});
}

export default main;
