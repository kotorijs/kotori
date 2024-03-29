import { none } from '@kotori-bot/tools';
import type { EventDataTargetId } from '../types';

export class Elements {
  private default(...args: unknown[]) {
    none(this, args);
    return '';
  }

  at(target: EventDataTargetId, ...extra: unknown[]) {
    return this.default(target, extra);
  }

  image(url: string, ...extra: unknown[]) {
    return this.default(url, extra);
  }

  voice(url: string, ...extra: unknown[]) {
    return this.default(url, extra);
  }

  video(url: string, ...extra: unknown[]) {
    return this.default(url, extra);
  }

  face(id: number | string, ...extra: unknown[]) {
    return this.default(id, extra);
  }

  file(data: unknown, ...extra: unknown[]) {
    return this.default(data, extra);
  }

  supports() {
    const supports: (keyof Elements)[] = [];
    const keys: (keyof Elements)[] = ['at', 'image', 'voice', 'video', 'face', 'file'];
    keys.forEach((key) => {
      if (this[key] !== new Elements()[key]) supports.push(key);
    });
    return supports;
  }
}

export default Elements;
