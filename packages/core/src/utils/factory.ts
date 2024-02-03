import type { Context } from '../context';

export function disposeFactory(ctx: Context, dispose: Function) {
  ctx.once('dispose', (session) => {
    if (!session.module) {
      dispose();
      return;
    }
    if (typeof session.module === 'object' ? session.module.pkg.name : session.module === ctx.identity) dispose();
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
