import { Container } from '@kotori-bot/core';

export * from '@kotori-bot/core';
export * from '@kotori-bot/loader';

export const Kotori = new Proxy(Container.getMixin(), {
  get: (_, prop) => {
    const target = Container.getMixin();
    if (prop === undefined) return target;
    return target[prop as keyof typeof target];
  }
});

export default Kotori;
