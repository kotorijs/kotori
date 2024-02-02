export interface EventDataBase<T extends keyof EventsList> {
  type: T;
}

export interface EventsList {}
