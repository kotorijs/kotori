import { Context } from '../context';

export function disposeFactory(ctx: Context, dispose: Function) {
  ctx.on('dispose', (session) => {
    if (!session.module) return;
    if (
      typeof session.module === 'string'
        ? session.module === ctx.identity
        : session.module.package.name === ctx.identity
    )
      dispose();
  });
}
