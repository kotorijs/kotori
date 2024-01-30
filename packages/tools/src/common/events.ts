export interface EventsList {
  ready: { type: 'ready' };
  error: { type: 'type' };
  dispose: { type: 'dispose' };
}

type EventCallback<A, T extends keyof A> = (data: A[T]) => void;
type EventBeforeKeys<T> = T extends `before_${infer U}` ? U : never;
type StackType<A> = {
  [K in keyof A]: EventCallback<A, K>[];
};

export class Events<A extends { [propName: string]: any } = EventsList> {
  private eventStack: StackType<A> = {} as StackType<A>;

  emit<T extends keyof A>(type: T, data: Omit<A[T], 'type'>) {
    const session = Object.assign(data, { type }) as unknown as A[T];
    if (!this.eventStack[type]) return;
    this.eventStack[type].forEach((el) => el(session));
  }

  on<T extends keyof A>(type: T, callback: EventCallback<A, T>) {
    if (!(type in this.eventStack)) this.eventStack[type] = [];
    const index = this.eventStack[type].length;
    this.eventStack[type].push(callback);
    return () => {
      if (!this.eventStack[type] || !this.eventStack[type][index]) return;
      delete this.eventStack[type][index];
    };
  }

  before<T extends EventBeforeKeys<keyof A>>(type: T, callback: EventCallback<A, `before_${T}`>) {
    this.on(`before_${type}`, callback);
  }

  once<T extends keyof A>(type: T, callback: EventCallback<A, T>) {
    const index = this.eventStack[type] ? this.eventStack[type].length : 0;
    return this.on(type, (data) => {
      delete this.eventStack[type][index];
      callback(data);
    });
  }

  off<T extends keyof A>(type: T, callback: EventCallback<A, T>) {
    if (!this.eventStack[type]) return;
    this.eventStack[type] = this.eventStack[type].filter((el) => callback !== el) as StackType<A>[T];
  }

  offAll<T extends keyof A>(type: T) {
    if (!this.eventStack[type]) return;
    this.eventStack[type] = [];
  }
}

export default Events;
