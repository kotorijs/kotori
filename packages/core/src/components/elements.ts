import type { Adapter } from './adapter'
import type { Api } from './api'
import type { AdapterConfig, Message, MessageMapping } from '../types'
import { none } from '@kotori-bot/tools'
import { Messages } from '.'

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
   * Decode a elements handler.
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
  public abstract decode(message: Exclude<Message, string>, meta?: object): string

  /**
   * Decode a mention message.
   *
   * @param userId - User id
   * @param meta - Message metadata
   * @returns Mention message
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
   */
  public abstract getSupportsElements(): (keyof MessageMapping)[]
}

export default Elements
