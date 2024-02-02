import type { Context } from '../context';

export function disposeFactory(ctx: Context, dispose: Function) {
  ctx.on('dispose', (session) => {
    // if (!session.module) return;
    if (
      typeof session.module === 'object'
        ? session.module.package.name === ctx.identity
        : session.module === ctx.identity
    )
      dispose();
  });
}

export function cancelFactory() {
  return {
    get() {
      return () => this.fn();
    },
    fn() {
      this.value = true;
    },
    value: false
  };
}
