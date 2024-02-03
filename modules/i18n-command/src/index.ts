import { CommandError, Context, TsuError } from 'kotori-bot';

export const lang = [__dirname, '../locales'];

export function main(ctx: Context) {
  console.log(ctx.identity);
  ctx.on('parse', (session) => {
    if (!(session.result instanceof CommandError)) return;
    const { value } = session.result;
    session.cancel();
    const { quick } = session.event;
    switch (value.type) {
      case 'arg_error':
        quick(['corei18n.template.args_error', value]);
        break;
      case 'arg_few':
        quick(['corei18n.template.args_few', value]);
        break;
      case 'arg_many':
        quick(['corei18n.template.args_many', value]);
        break;
      case 'option_error':
        quick(['corei18n.template.option_error', value]);
        break;
      case 'syntax':
        quick(['corei18n.template.syntax', value]);
        break;
      case 'unknown':
        quick(['corei18n.template.unknown', value]);
        break;
      default:
    }
  });

  ctx.on('command', (session) => {
    if (!(session.result instanceof CommandError)) return;
    const { value } = session.result;
    const { quick } = session.event;
    switch (value.type) {
      case 'res_error':
        quick(['corei18n.template.res_error', { content: value.error.message }]);
        break;
      case 'num_error':
        quick(['corei18n.template.num_error', value]);
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
        quick(['corei18n.template.exists', value]);
        break;
      case 'no_exists':
        quick(['corei18n.template.no_exists', value]);
        break;
      case 'error':
        ctx.logger.error(value.error);
        if (value.error instanceof TsuError) {
          quick(['corei18n.template.res_error', { content: value.error.message }]);
          return;
        }
        if (value.error instanceof Error) {
          quick(['corei18n.template.error', { error: `${value.error.name} ${value.error.message}` }]);
          return;
        }
        if (typeof value.error === 'object') {
          quick(['corei18n.template.error', { error: JSON.stringify(value.error) }]);
          return;
        }
        quick(['corei18n.template.error', { error: value.error as string }]);
        break;
      default:
    }
  });
}
