import { none } from '@kotori-bot/tools'
import type { Message, MessageMapping } from '../types'
import type { Adapter } from './adapter'
import { Messages } from './messages'

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
  // biome-ignore lint: *
  public readonly adapter: Adapter<any, any, any>

  /**
   * Decode a elements handler.
   *
   * @param adapter - Adapter instance
   */
  // biome-ignore lint: *
  public constructor(adapter: Adapter<any, any, any>) {
    this.adapter = adapter
  }

  /**
   * Encode raw message string to `Message`.
   *
   * @param raw - Raw message
   * @param meta - Message metadata
   * @returns Encoded message
   *
   * @abstract
   */
  public abstract encode(raw: string, meta?: object): Message

  /**
   * Decode `Message` elements to string.
   *
   * @param message - Message to decode
   * @param meta - Message metadata
   * @returns Decoded message
   *
   * @abstract
   */
  public abstract decode(message: Message, meta?: object): string

  /**
   * Decode a mention message.
   *
   * @param userId - User id
   * @param meta - Message metadata
   * @returns Mention message
   *
   * @deprecated
   */
  public mention(userId: string, meta: object = {}) {
    none(meta)
    return this.decode(Messages.mention(userId))
  }

  /**
   * Decode a mention all message.
   *
   * @param meta - Message metadata
   * @returns Mention all message
   *
   * @deprecated
   */
  public mentionAll(meta: object = {}) {
    none(meta)
    return this.decode(Messages.mentionAll())
  }

  /**
   * Decode an image message.
   *
   * @param content - Image content
   * @param meta - Message metadata
   * @returns Image message
   *
   * @deprecated
   */
  public image(content: string, meta: object = {}) {
    none(meta)
    return this.decode(Messages.image(content))
  }

  /**
   * Decode a voice message.
   *
   * @param content - Voice content
   * @param meta - Message metadata
   * @returns Voice message
   *
   * @deprecated
   */
  public voice(content: string, meta: object = {}) {
    none(meta)
    return this.decode(Messages.voice(content))
  }

  /**
   * Decode an audio message.
   *
   * @param content - Audio content
   * @param meta - Message metadata
   * @returns Audio message
   *
   * @deprecated
   */
  public audio(content: string, meta: object = {}) {
    none(meta)
    return this.decode(Messages.audio(content))
  }

  /**
   * Decode a video message.
   *
   * @param content - Video content
   * @param meta - Message metadata
   * @returns Video message
   *
   * @deprecated
   */
  public video(content: string, meta: object = {}) {
    none(meta)
    return this.decode(Messages.video(content))
  }

  /**
   * Decode a file message.
   *
   * @param content - File content
   * @param meta - Message metadata
   * @returns File message
   *
   * @deprecated
   */
  public file(content: string, meta: object = {}) {
    none(meta)
    return this.decode(Messages.file(content))
  }

  /**
   * Decode a location message.
   *
   * @param latitude - Latitude
   * @param longitude - Longitude
   * @param title - Title
   * @param content - Content
   * @param meta - Message metadata
   * @returns Location message
   *
   * @deprecated
   */
  public location(latitude: number, longitude: number, title: string, content: string, meta: object = {}) {
    none(meta)
    return this.decode(Messages.location(latitude, longitude, title, content))
  }

  /**
   * Decode a reply message.
   *
   * @param messageId - Message id
   * @param meta - Message metadata
   * @returns Reply message
   *
   * @deprecated
   */
  public reply(messageId: string, meta: object = {}) {
    none(meta)
    return this.decode(Messages.reply(messageId))
  }

  /**
   * Get supported elements.
   *
   * @returns Supported elements
   *
   * @abstract
   *
   * @deprecated
   */
  public abstract getSupportsElements(): (keyof MessageMapping)[]
}

export default Elements
