import { none } from '@kotori-bot/tools';
import type { EventDataTargetId } from '../types';
import type { Adapter } from './adapter';

export class Elements<T extends Adapter = Adapter> {
  private default(...args: unknown[]) {
    none(this, args);
    return '';
  }

  protected adapter: T;

  constructor(adapter: T) {
    this.adapter = adapter;
  }

  at(target: EventDataTargetId, extra?: unknown) {
    return this.default(target, extra);
  }

  image(url: string, extra?: unknown) {
    return this.default(url, extra);
  }

  voice(url: string, extra?: unknown) {
    return this.default(url, extra);
  }

  video(url: string, extra?: unknown) {
    return this.default(url, extra);
  }

  face(id: number | string, extra?: unknown) {
    return this.default(id, extra);
  }

  file(data: unknown, extra?: unknown) {
    return this.default(data, extra);
  }

  supports() {
    const supports: (keyof Elements)[] = [];
    const keys: (keyof Elements)[] = ['at', 'image', 'voice', 'video', 'face', 'file'];
    keys.forEach((key) => {
      if (this[key] !== new Elements(this.adapter)[key]) supports.push(key);
    });
    return supports;
  }
}

export default Elements;
