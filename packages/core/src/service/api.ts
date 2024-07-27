import { none } from '@kotori-bot/tools'
import type Adapter from './adapter'
import type { MessageRaw } from '../types'

/** Response for sending message */
interface SendMessageResponse {
  /** Message id */
  messageId: string
  /** Send time (milliseconds timestamp) */
  time: number
}

/** Response for bot self information. */
interface SelfInfoResponse {
  /** User id */
  userId: string
  /** User name or nickname */
  username: string
  /** The display name, or empty string if none */
  userDisplayname: string
}

/** Response for user information. */
interface UserInfoResponse extends SelfInfoResponse {
  /** The remark name set set by current bot account, or empty string if none */
  userRemark: string
}

/** Response for group information. */
interface GroupInfoResponse {
  /** Group id */
  groupId: string
  /** Group name */
  groupName: string
}

/** Response for guild information. */
interface GuildInfoResponse {
  /** Guild id */
  guildId: string
  /** Guild name */
  guildName: string
}

/** Response for channel information. */
interface ChannelInfoResponse {
  /** Channel id */
  channelId: string
  /** Channel name */
  channelName: string
}

/** Response for file upload. */
interface UploadFileResponse {
  /** File id */
  filedId: string
}

/** Response for file get. */
interface GetFileResponse {
  /** File name */
  name: string
  /** File data (origin binary)'s SHA256 checksum, all lowercase, optional  */
  sha256?: string
}

/** Response for file get url. */
interface GetFileUrlResponse extends GetFileResponse {
  /** File url */
  url: string
  /** File download url headers, or empty object if none */
  headers: Record<string, string>
}

/** Response for file get path. */
interface GetFilePathResponse extends GetFileResponse {
  /** File path */
  path: string
}

/** Response for file get data. */
interface GetFileDataResponse extends GetFileResponse {
  /** File data */
  data: Buffer
}

/**
 * Api Class which identify bot's standard platform apis.
 *
 * For different `api` child class, not most of them have implementation.
 *
 * @abstract
 */
export class Api {
  /**
   * Current api's bot instance.
   *
   * @readonly
   */
  public readonly adapter: Adapter<this>

  /**
   * Api class constructor.
   *
   * @param adapter - Current api's bot instance
   */
  public constructor(adapter: Adapter) {
    this.adapter = adapter as Adapter<this>
  }

  /**
   * Send a private message.
   *
   * @param message - Message content to send
   * @param userId - Target user id
   * @param meta - Extra meta data
   * @returns Message id and send time
   *
   * @async
   */
  public async sendPrivateMsg(message: MessageRaw, userId: string, meta: object = {}): Promise<SendMessageResponse> {
    none(this, message, userId, meta)
    return { messageId: '', time: 0 }
  }

  /**
   * Send a group message.
   *
   * @param message - Message content to send
   * @param groupId - Target group id
   * @param meta - Extra meta data
   * @returns Message id and send time
   *
   * @async
   */
  public async sendGroupMsg(message: MessageRaw, groupId: string, meta: object = {}): Promise<SendMessageResponse> {
    none(this, message, groupId, meta, meta)
    return { messageId: '', time: 0 }
  }

  /**
   * Send a guild message.
   *
   * @param message - Message content to send
   * @param guildId - Target guild id
   * @param channelId - Target channel id
   * @param meta - Extra meta data
   * @returns Message id and send time
   *
   * @async
   */
  public async sendGuildMsg(
    message: MessageRaw,
    guildId: string,
    channelId: string,
    meta: object = {}
  ): Promise<SendMessageResponse> {
    none(this, message, guildId, channelId, meta)
    return { messageId: '', time: 0 }
  }

  /**
   * Delete a message.
   *
   * Required target message that is sent by self or bot had manger permission.
   *
   * @param messageId - Target message id
   * @param meta - Extra meta data
   *
   * @async
   */
  public deleteMsg(messageId: string, meta: object = {}) {
    none(this, messageId, meta)
  }

  /**
   * Get information about the bot itself.
   *
   * @returns Self info
   *
   * @async
   */
  public async getSelfInfo(meta: object = {}): Promise<SelfInfoResponse> {
    none(this, meta)
    return { userId: '', username: '', userDisplayname: '' }
  }

  /**
   * Get user information.
   *
   * @param userId - Target user id, can be the friend or the stronger
   * @param meta - Extra meta data
   * @returns User info
   *
   * @async
   */
  public async getUserInfo(userId: string, meta: object = {}): Promise<UserInfoResponse> {
    none(this, userId, meta)
    return { userId: '', username: '', userDisplayname: '', userRemark: '' }
  }

  /**
   * Get friend list.
   *
   * @param meta - Extra meta data
   * @returns Friend list information
   *
   * @async
   */
  public async getFriendList(meta: object = {}): Promise<UserInfoResponse[]> {
    none(this, meta)
    return []
  }

  /**
   * Get group information.
   *
   * @param groupId - Target group id
   * @param meta - Extra meta data
   * @returns Group info
   *
   * @async
   */
  public async getGroupInfo(groupId: string, meta: object = {}): Promise<GroupInfoResponse> {
    none(this, groupId, meta)
    return { groupId: '', groupName: '' }
  }

  /**
   * Get group list.
   *
   * @param meta - Extra meta data
   * @returns Group list information
   *
   * @async
   */
  public async getGroupList(meta: object = {}): Promise<GroupInfoResponse[]> {
    none(this, meta)
    return []
  }

  /**
   * Set group information.
   *
   * @param groupId - Target group id
   * @param groupName - Group name
   * @param meta - Extra meta data
   */
  public setGroupName(groupId: string, groupName: string, meta: object = {}) {
    none(this, groupId, groupName, meta)
  }

  /**
   * Leave a group.
   *
   * @param groupId - Target group id
   * @param meta - Extra meta data
   */
  public leaveGroup(groupId: string, meta: object = {}) {
    none(this, groupId, meta)
  }

  /**
   * Get guild information.
   *
   * @param guildId - Target guild id
   * @param meta - Extra meta data
   * @returns Guild info
   *
   * @async
   */
  public async getGuildInfo(guildId: string, meta: object = {}): Promise<GuildInfoResponse> {
    none(this, guildId, meta)
    return { guildId: '', guildName: '' }
  }

  /**
   * Get guild list.
   *
   * @param meta - Extra meta data
   * @returns Guild list information
   *
   * @async
   */
  public async getGuildList(meta: object = {}): Promise<GuildInfoResponse[]> {
    none(this, meta)
    return []
  }

  /**
   * Set guild information.
   *
   * @param guildId - Target guild id
   * @param guildName - Guild name
   * @param meta - Extra meta data
   */
  public setGuildName(guildId: string, guildName: string, meta: object = {}) {
    none(this, guildId, guildName, meta)
  }

  /**
   * Get guild member information.
   *
   * @param guildId - Target guild id
   * @param channelId - Target channel id
   * @param userId - Target user id
   * @param meta - Extra meta data
   * @returns Guild member info
   *
   * @async
   */
  public async getGuildMemberInfo(guildId: string, userId: string, meta: object = {}): Promise<UserInfoResponse> {
    none(this, guildId, userId, meta)
    return { userId: '', username: '', userDisplayname: '', userRemark: '' }
  }

  /**
   * Get guild member list.
   *
   * @param guildId - Target guild id
   * @param channelId - Target channel id
   * @param meta - Extra meta data
   * @returns Guild member list information
   *
   * @async
   */
  public async getGuildMemberList(guildId: string, meta: object = {}): Promise<UserInfoResponse[]> {
    none(this, guildId, meta)
    return []
  }

  /**
   * Leave a guild.
   *
   * @param guildId - Target guild id
   * @param meta - Extra meta data
   */
  public leaveGuild(guildId: string, meta: object = {}) {
    none(this, guildId, meta)
  }

  /**
   * Get channel information.
   *
   * @param guildId - Target guild id
   * @param channelId - Target channel id
   * @param meta - Extra meta data
   * @returns Channel info
   *
   * @async
   */
  public async getChannelInfo(guildId: string, channelId: string, meta: object = {}): Promise<ChannelInfoResponse> {
    none(this, guildId, channelId, meta)
    return { channelId: '', channelName: '' }
  }

  /**
   * Get channel list.
   *
   * @param guildId - Target guild id
   * @param joinedOnly - Whether to get joined channels only, default is false
   * @param meta - Extra meta data
   * @returns Channel list information
   *
   * @async
   */
  public async getChannelList(guildId: string, joinedOnly = false, meta: object = {}): Promise<ChannelInfoResponse[]> {
    none(this, guildId, joinedOnly, meta)
    return []
  }

  /**
   * Set channel information.
   *
   * @param guildId - Target guild id
   * @param channelId - Target channel id
   * @param channelName - Channel name
   * @param meta - Extra meta data
   */
  public setChannelName(guildId: string, channelId: string, channelName: string, meta: object = {}) {
    none(this, guildId, channelId, channelName, meta)
  }

  /**
   * Get channel member information.
   *
   * @param guildId - Target guild id
   * @param channelId - Target channel id
   * @param userId - Target user id
   * @param meta - Extra meta data
   * @returns Channel member info
   *
   * @async
   */
  public async getChannelMemberInfo(
    guildId: string,
    channelId: string,
    userId: string,
    meta: object = {}
  ): Promise<UserInfoResponse> {
    none(this, guildId, channelId, userId, meta)
    return { userId: '', username: '', userDisplayname: '', userRemark: '' }
  }

  /**
   * Get channel member list.
   *
   * @param guildId - Target guild id
   * @param channelId - Target channel id
   * @param meta - Extra meta data
   * @returns Channel member list information
   *
   * @async
   */
  public async getChannelMemberList(
    guildId: string,
    channelId: string,
    meta: object = {}
  ): Promise<UserInfoResponse[]> {
    none(this, guildId, channelId, meta)
    return []
  }

  /**
   * Leave a channel.
   *
   * @param guildId - Target guild id
   * @param channelId - Target channel id
   * @param meta - Extra meta data
   */
  public leaveChannel(guildId: string, channelId: string, meta: object = {}) {
    none(this, guildId, channelId, meta)
  }

  /**
   * Upload file from url.
   *
   * @param name - File name
   * @param url - File url
   * @param headers - File download url headers, optional
   * @param meta - Extra meta data
   * @returns File id
   *
   * @async
   */
  public async uploadFileUrl(
    name: string,
    url: string,
    headers: Record<string, string> = {},
    meta: object = {}
  ): Promise<UploadFileResponse> {
    none(this, name, url, headers, meta)
    return { filedId: '' }
  }

  /**
   * Upload file from path.
   *
   * @param name - File name
   * @param path - File path
   * @param meta - Extra meta data
   * @returns File id
   *
   * @async
   */
  public async uploadFilePath(name: string, path: string, meta: object = {}): Promise<UploadFileResponse> {
    none(this, name, path, meta)
    return { filedId: '' }
  }

  /**
   * Upload file from data.
   *
   * @param name - File name
   * @param data - File data
   * @param meta - Extra meta data
   * @returns File id
   *
   * @async
   */
  public async uploadFileData(name: string, data: Buffer, meta: object = {}): Promise<UploadFileResponse> {
    none(this, name, data, meta)
    return { filedId: '' }
  }

  /**
   * Get file url.
   *
   * @param filedId - File id
   * @param meta - Extra meta data
   * @returns File url data
   *
   * @async
   */
  public async getFileUrl(filedId: string, meta: object = {}): Promise<GetFileUrlResponse> {
    none(this, filedId, meta)
    return { name: '', sha256: '', url: '', headers: {} }
  }

  /**
   * Get file path.
   *
   * @param filedId - File id
   * @param meta - Extra meta data
   * @returns File path data
   *
   * @async
   */
  public async getFilePath(filedId: string, meta: object = {}): Promise<GetFilePathResponse> {
    none(this, filedId, meta)
    return { name: '', sha256: '', path: '' }
  }

  /**
   * Get file data.
   *
   * @param filedId - File id
   * @param meta - Extra meta data
   * @returns File data
   *
   * @async
   */
  public async getFileData(filedId: string, meta: object = {}): Promise<GetFileDataResponse> {
    none(this, filedId, meta)
    return { name: '', sha256: '', data: Buffer.from('') }
  }

  /**
   * Get supported actions.
   *
   * @returns Supported actions
   */
  public getSupportedActions(): Exclude<keyof Api, 'adapter'>[] {
    return []
  }

  /**
   * Set group information.
   *
   * @param groupId - Target group id
   * @param groupName - Group name
   * @param meta - Extra meta data
   *
   * @experimental
   */
  public setGroupAvatar(groupId: string, image: string, meta: object = {}) {
    none(this, groupId, image, meta)
  }

  /**
   * Set group information.
   *
   * @param groupId - Target group id
   * @param groupName - Group name
   * @param meta - Extra meta data
   *
   * @experimental
   */
  public setGroupAdmin(groupId: string, userId: string, enable: boolean, meta: object = {}) {
    none(this, groupId, userId, enable, meta)
  }

  /**
   * Set group information.
   *
   * @param groupId - Target group id
   * @param groupName - Group name
   * @param meta - Extra meta data
   *
   * @experimental
   */
  public setGroupCard(groupId: string, userId: string, card: string, meta: object = {}) {
    none(this, groupId, userId, card, meta)
  }

  /**
   * Set group information.
   *
   * @param groupId - Target group id
   * @param groupName - Group name
   * @param meta - Extra meta data
   *
   * @experimental
   */
  public setGroupBan(groupId: string, userId?: string, time?: number, meta: object = {}) {
    none(this, groupId, userId, time, meta)
  }

  /**
   * Set group information.
   *
   * @param groupId - Target group id
   * @param groupName - Group name
   * @param meta - Extra meta data
   *
   * @experimental
   */
  public sendGroupNotice(groupId: string, content: string, image?: string, meta: object = {}) {
    none(this, groupId, content, image, meta)
  }

  /**
   * Set group information.
   *
   * @param groupId - Target group id
   * @param groupName - Group name
   * @param meta - Extra meta data
   *
   * @experimental
   */
  public setGroupKick(groupId: string, userId: string, meta: object = {}) {
    none(this, groupId, userId, meta)
  }
}

export default Api
