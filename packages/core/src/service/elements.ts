import { none } from '@kotori-bot/tools'
import type { EventDataTargetId } from '../types'

export class Elements {
  private default(...args: unknown[]) {
    none(this, args)
    return ''
  }

  public at(target: EventDataTargetId, ...extra: unknown[]) {
    return this.default(target, extra)
  }

  public image(url: string, ...extra: unknown[]) {
    return this.default(url, extra)
  }

  public voice(url: string, ...extra: unknown[]) {
    return this.default(url, extra)
  }

  public video(url: string, ...extra: unknown[]) {
    return this.default(url, extra)
  }

  public face(id: number | string, ...extra: unknown[]) {
    return this.default(id, extra)
  }

  public file(data: unknown, ...extra: unknown[]) {
    return this.default(data, extra)
  }

  public supports() {
    const supports: (keyof Elements)[] = []
    const keys: (keyof Elements)[] = ['at', 'image', 'voice', 'video', 'face', 'file']
    for (const key of keys) if (this[key] !== new Elements()[key]) supports.push(key)
    return supports
  }
}

export default Elements
