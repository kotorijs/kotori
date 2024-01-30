import type { EventsList, EventCallback } from '../types';
import Core from './core';

type EventBeforeKeys<T> = T extends `before_${infer U}` ? U : never;

export class Events extends Core {
  private eventStack: { type: keyof EventsList; callback: EventCallback<keyof EventsList> }[] = [];

  emit<T extends keyof EventsList>(type: T, data: Omit<EventsList[T], 'type'>) {
    const session = Object.assign(data, { type }) as unknown as EventsList[T];
    this.eventStack.filter((el) => el.type === type).forEach((el) => el.callback(session));
  }

  on<T extends keyof EventsList>(type: T, callback: EventCallback<T>) {
    // if (this.eventStack.filter(el => el.callback === callback && el.type === type).length > 0) return false;
    this.eventStack.push({ type, callback: callback as EventCallback<keyof EventsList> });
  }

  before<T extends EventBeforeKeys<keyof EventsList>>(type: T, callback: EventCallback<`before_${T}`>) {
    this.on(`before_${type}`, callback);
  }

  once<T extends keyof EventsList>(type: T, callback: EventCallback<T>) {
    const removeSelf: EventCallback<T> = (data) => {
      const handleArr = this.eventStack.filter((el) => el.type !== type && el.callback !== removeSelf);
      this.eventStack = handleArr;
      callback(data);
    };
    this.on(type, removeSelf);
  }

  off<T extends keyof EventsList>(type: T, callback: EventCallback<T>) {
    const handleArr = this.eventStack.filter((el) => el.callback !== callback && el.type !== type);
    // if (this.eventStack.length === handleArr.length) return false;
    this.eventStack = handleArr;
  }

  offAll<T extends keyof EventsList>(type: T) {
    const handleArr = this.eventStack.filter((el) => el.type !== type);
    // if (this.eventStack.length === handleArr.length) return false;
    this.eventStack = handleArr;
  }
}

export default Events;
