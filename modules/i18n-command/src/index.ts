import { CommandAccess, CommandError, Context, MessageScope, TsuError } from 'kotori-bot';

export const lang = [__dirname, '../locales'];

export function main(ctx: Context) {
  ctx.on('parse', (data) => {
    const { quick } = data.session;
    if (!(data.result instanceof CommandError)) {
      const { scope, access } = data.command.meta;
      if (scope && scope !== 'all' && data.session.type !== scope) {
        quick('corei18n.template.scope');
        data.cancel();
      } else if (data.session.userId !== data.session.api.adapter.config.master) {
        if (access === CommandAccess.ADMIN) {
          quick('corei18n.template.no_access_admin');
          data.cancel();
        } else if (
          access === CommandAccess.MANGER &&
          (data.session.type === MessageScope.PRIVATE || data.session.sender.role === 'member')
        ) {
          quick('corei18n.template.no_access_manger');
          data.cancel();
        }
      }
      return;
    }
    data.cancel();
    const { value } = data.result;
    switch (value.type) {
      case 'arg_error':
        quick(['corei18n.template.args_error', [value.index, value.expected, value.reality]]);
        break;
      case 'arg_few':
        quick(['corei18n.template.args_few', [value.expected, value.reality]]);
        break;
      case 'arg_many':
        quick(['corei18n.template.args_many', [value.expected, value.reality]]);
        break;
      case 'option_error':
        quick(['corei18n.template.option_error', [value.target, value.expected, value.reality]]);
        break;
      case 'syntax':
        quick(['corei18n.template.syntax', [value.index, value.char]]);
        break;
      case 'unknown':
        quick(['corei18n.template.unknown', [value.input]]);
        break;
      default:
    }
  });

  ctx.on('command', (data) => {
    if (!(data.result instanceof CommandError)) return;
    const { value } = data.result;
    const { quick } = data.session;
    switch (value.type) {
      case 'res_error':
        quick(['corei18n.template.res_error', [value.error.message]]);
        break;
      case 'num_error':
        quick('corei18n.template.num_error');
        break;
      case 'no_access_manger':
        quick('corei18n.template.no_access_manger');
        break;
      case 'no_access_admin':
        quick('corei18n.template.no_access_admin');
        break;
      case 'disable':
        quick('corei18n.template.disable');
        break;
      case 'exists':
        quick(['corei18n.template.exists', [value.target]]);
        break;
      case 'no_exists':
        quick(['corei18n.template.no_exists', [value.target]]);
        break;
      case 'error':
        ctx.logger.error(value.error);
        if (value.error instanceof TsuError) {
          quick(['corei18n.template.res_error', [value.error.message]]);
          return;
        }
        if (value.error instanceof Error) {
          quick(['corei18n.template.error', [`${value.error.name} ${value.error.message}`]]);
          return;
        }
        if (typeof value.error === 'object') {
          quick(['corei18n.template.error', [JSON.stringify(value.error)]]);
          return;
        }
        quick(['corei18n.template.error', [String(value.error)]]);
        break;
      case 'data_error':
        quick([
          `corei18n.template.data_error.${typeof value.target === 'string' ? 'options' : 'args'}`,
          [value.target]
        ]);
        break;
      default:
    }
  });
}
