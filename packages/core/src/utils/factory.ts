import type { Context } from '../context';

export function disposeFactory(ctx: Context, dispose: Function) {
  ctx.once('dispose_module', (data) => {
    if ((typeof data.instance === 'object' ? data.instance.name : data.instance) !== ctx.identity) {
      disposeFactory(ctx, dispose);
      return;
    }
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
