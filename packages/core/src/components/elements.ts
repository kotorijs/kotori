import type { Adapter } from './adapter'
import type { Api } from './api'
import type { AdapterConfig, Message, MessageMapping } from '../types'
import { none } from '@kotori-bot/tools'

/**
 * Elements handler base class.
 *
 * @abstract
 */
export abstract class Elements {
  /**
   * Adapter instance.
   *
   * @readonly
   */
  public readonly adapter: Adapter<Api, AdapterConfig, this>

  /**
   * Create a elements handler.
   *
   * @param adapter - Adapter instance
   */
  public constructor(adapter: Adapter) {
    this.adapter = adapter as Adapter<Api, AdapterConfig, this>
  }

  /**
   * Encode raw message string to `Message`.
   *
   * @param raw - Raw message
   * @param meta - Message metadata
   * @returns Encoded message
   */
  public encode(raw: string, meta: object = {}): Message {
    none(meta)
    return raw
  }

  /**
   * Decode `Message` elements to string.
   *
   * @param message - Message to decode
   * @returns Decoded message
   */
  // biome-ignore lint:
  public decode(message: Message): any {
    return message.toString()
  }

  /**
   * Get supported elements.
   *
   * @returns Supported elements
   *
   * @abstract
   */
  public abstract getSupportsElements(): (keyof MessageMapping)[]
}

export default Elements
