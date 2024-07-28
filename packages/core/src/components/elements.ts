import { none } from '@kotori-bot/tools'
import type { Adapter } from './adapter'
import type { Api } from './api'
import type { AdapterConfig } from '../types'

export abstract class Elements {
  public readonly adapter: Adapter<Api, AdapterConfig, this>

  public constructor(adapter: Adapter) {
    this.adapter = adapter as Adapter<Api, AdapterConfig, this>
  }

  private default(...args: unknown[]) {
    none(this, args)
    return ''
  }

  public at(target: string, ...extra: unknown[]) {
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

  public getSupports() {
    return (['at', 'image', 'voice', 'video', 'face', 'file'] as const).filter(
      (key) => this[key] && this[key] !== Object.getPrototypeOf(Object.getPrototypeOf(key))[key]
    )
  }
}

export default Elements
