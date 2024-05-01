interface EventsList {
  // before_ready(): void;
  ready(): void;
  error(error: Error): void;
  dispose(): void;
}

type EventsMappingType<T> = {
  [K in keyof T]: T[K] extends EventsCallback ? T[K] : never;
};

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
type EventsCallback = (...args: any) => unknown;
// type EventsBeforeKeys<T> = T extends `before_${infer U}` ? U : never;

export class Events<A = EventsList> {
  protected list: Map<keyof EventsMappingType<A>, Set<EventsMappingType<A>[keyof EventsMappingType<A>]>> = new Map();

  public emit<T extends keyof EventsMappingType<A>>(type: T, ...data: [...Parameters<EventsMappingType<A>[T]>]) {
    if (!this.list.has(type)) return;
    this.list.get(type)!.forEach((callback) => callback(...data));
  }

  public async parallel<T extends keyof EventsMappingType<A>>(
    type: T,
    ...data: [...Parameters<EventsMappingType<A>[T]>]
  ) {
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

  public on<T extends keyof EventsMappingType<A>>(type: T, callback: EventsMappingType<A>[T]) {
    if (!this.list.has(type)) this.list.set(type, new Set());
    this.list.get(type)!.add(callback);
  }

  public once<T extends keyof EventsMappingType<A>>(type: T, callback: EventsMappingType<A>[T]) {
    const fallback = ((...data: [...Parameters<EventsMappingType<A>[T]>]) => {
      this.off(type, fallback);
      return callback(...data);
    }) as EventsMappingType<A>[T];
    this.on(type, fallback);
  }
  /* 
  before<T extends EventsBeforeKeys<keyof EventsMappingType<A>>>(type: T, callback: EventsMappingType<A>[T extends never ? never : `before_${T}`]) {
    this.on(`before_${type}` as Parameters<typeof this.on>[0], callback as Parameters<typeof this.on>[1]);
  } */

  public off<T extends keyof EventsMappingType<A>>(type: T, callback: EventsMappingType<A>[T]) {
    if (!this.list.has(type)) return;
    this.list.get(type)!.delete(callback);
  }

  public offAll<T extends keyof EventsMappingType<A>>(type: T) {
    if (!this.list.has(type)) return;
    this.list.delete(type);
  }
}

export default Events;
