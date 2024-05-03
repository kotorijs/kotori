declare module './context' {
  interface Context {
    emit: Events<EventsMapping>['emit'];
    parallel: Events<EventsMapping>['parallel'];
    on: Events<EventsMapping>['on'];
    once: Events<EventsMapping>['once'];
    off: Events<EventsMapping>['off'];
    offAll: Events<EventsMapping>['offAll'];
  }
}

export interface EventsMapping {
  // before_ready(): void;
  ready(): void;
  error(error: Error): void;
  dispose(): void;
}

export type EventsList = {
  [K in keyof EventsMapping]: Parameters<EventsMapping[K]>[1] extends never | undefined | null
    ? Parameters<EventsMapping[K]>[0]
    : [...Parameters<EventsMapping[K]>];
};

type EventsTool<T> = {
  [K in keyof T]: T[K] extends EventsCallback ? T[K] : never;
};

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
type EventsCallback = (...args: any) => unknown;
// type EventsBeforeKeys<T> = T extends `before_${infer U}` ? U : never;

export class Events<A = EventsMapping> {
  protected list: Map<keyof EventsTool<A>, Set<EventsTool<A>[keyof EventsTool<A>]>> = new Map();

  public emit<T extends keyof EventsTool<A>>(type: T, ...data: [...Parameters<EventsTool<A>[T]>]) {
    if (!this.list.has(type)) return;
    this.list.get(type)!.forEach((callback) => callback(...data));
  }

  public async parallel<T extends keyof EventsTool<A>>(type: T, ...data: [...Parameters<EventsTool<A>[T]>]) {
    if (!this.list.has(type)) return;
    const tasks: Promise<unknown>[] = [];
    this.list.get(type)!.forEach((callback) =>
      tasks.push(
        new Promise(() => {
          callback(...data);
        })
      )
    );
    await Promise.all(tasks);
  }

  public on<T extends keyof EventsTool<A>>(type: T, callback: EventsTool<A>[T]) {
    if (!this.list.has(type)) this.list.set(type, new Set());
    this.list.get(type)!.add(callback);
  }

  public once<T extends keyof EventsTool<A>>(type: T, callback: EventsTool<A>[T]) {
    const fallback = ((...data: [...Parameters<EventsTool<A>[T]>]) => {
      this.off(type, fallback);
      return callback(...data);
    }) as EventsTool<A>[T];
    this.on(type, fallback);
  }
  /*
  before<T extends EventsBeforeKeys<keyof EventsTool<A>>>(type: T, callback: EventsTool<A>[T extends never ? never : `before_${T}`]) {
    this.on(`before_${type}` as Parameters<typeof this.on>[0], callback as Parameters<typeof this.on>[1]);
  } */

  public off<T extends keyof EventsTool<A>>(type: T, callback: EventsTool<A>[T]) {
    if (!this.list.has(type)) return;
    this.list.get(type)!.delete(callback);
  }

  public offAll<T extends keyof EventsTool<A>>(type: T) {
    if (!this.list.has(type)) return;
    this.list.delete(type);
  }
}

export default Events;
