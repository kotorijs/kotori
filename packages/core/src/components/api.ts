import { none } from '@kotori-bot/tools'
import type Adapter from './adapter'
import type {
  ChannelInfoResponse,
  GetFileDataResponse,
  GetFilePathResponse,
  GetFileUrlResponse,
  GroupInfoResponse,
  GuildInfoResponse,
  Message,
  SelfInfoResponse,
  SendMessageResponse,
  UploadFileResponse,
  UserInfoResponse
} from '../types'
import type { EventsMapping } from 'fluoro'
import type { Session } from './session'

type ReverseList = {
  [K in keyof EventsMapping]: Parameters<EventsMapping[K]>[0] extends Session ? K : never
}

type SessionEvents = ReverseList[keyof ReverseList]

type Actions = Exclude<keyof Api, 'adapter' | 'getSupportedEvents' | 'getSupportedEvents'>

/**
 * Api which identify bot's standard platform apis.
 *
 * For different `api` child class, not most of them have implementation.
 *
 * @class
 * @abstract
 */
export abstract class Api {
  /**
   * Get supported actions for current api implementation.
   *
   * @returns Supported actions
   */
  public getSupportedActions() {
    return (Object.getOwnPropertyNames(Api.prototype) as Actions[]).filter(
      (key) =>
        typeof key === 'string' &&
        !['getSupportedActions', 'adapter', 'constructor'].includes(key) &&
        this[key] instanceof Function &&
        this[key] !== Api.prototype[key]
    ) as Actions[]
  }

  public abstract getSupportedEvents(): SessionEvents[]

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
   * @param meta - Extra meta data, optional
   * @returns Message id and send time
   *
   * @async
   */
  public async sendPrivateMsg(message: Message, userId: string, meta: object = {}): Promise<SendMessageResponse> {
    none(this, message, userId, meta)
    return { messageId: '', time: 0 }
  }

  /**
   * Send a group message.
   *
   * @param message - Message content to send
   * @param groupId - Target group id
   * @param meta - Extra meta data, optional
   * @returns Message id and send time
   *
   * @async
   */
  public async sendGroupMsg(message: Message, groupId: string, meta: object = {}): Promise<SendMessageResponse> {
    none(this, message, groupId, meta, meta)
    return { messageId: '', time: 0 }
  }

  /**
   * Send a channel message.
   *
   * @param message - Message content to send
   * @param guildId - Target guild id
   * @param channelId - Target channel id
   * @param meta - Extra meta data, optional
   * @returns Message id and send time
   *
   * @async
   */
  public async sendChannelMsg(
    message: Message,
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
   * @param meta - Extra meta data, optional
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
   * @param meta - Extra meta data, optional
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
   * @param meta - Extra meta data, optional
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
   * @param meta - Extra meta data, optional
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
   * @param meta - Extra meta data, optional
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
   * @param meta - Extra meta data, optional
   */
  public setGroupName(groupId: string, groupName: string, meta: object = {}) {
    none(this, groupId, groupName, meta)
  }

  /**
   * Leave a group.
   *
   * @param groupId - Target group id
   * @param meta - Extra meta data, optional
   */
  public leaveGroup(groupId: string, meta: object = {}) {
    none(this, groupId, meta)
  }

  /**
   * Get guild information.
   *
   * @param guildId - Target guild id
   * @param meta - Extra meta data, optional
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
   * @param meta - Extra meta data, optional
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
   * @param meta - Extra meta data, optional
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
   * @param meta - Extra meta data, optional
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
   * @param meta - Extra meta data, optional
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
   * @param meta - Extra meta data, optional
   */
  public leaveGuild(guildId: string, meta: object = {}) {
    none(this, guildId, meta)
  }

  /**
   * Get channel information.
   *
   * @param guildId - Target guild id
   * @param channelId - Target channel id
   * @param meta - Extra meta data, optional
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
   * @param meta - Extra meta data, optional
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
   * @param meta - Extra meta data, optional
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
   * @param meta - Extra meta data, optional
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
   * @param meta - Extra meta data, optional
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
   * @param meta - Extra meta data, optional
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
   * @param meta - Extra meta data, optional
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
   * @param meta - Extra meta data, optional
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
   * @param meta - Extra meta data, optional
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
   * @param meta - Extra meta data, optional
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
   * @param meta - Extra meta data, optional
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
   * @param meta - Extra meta data, optional
   * @returns File data
   *
   * @async
   */
  public async getFileData(filedId: string, meta: object = {}): Promise<GetFileDataResponse> {
    none(this, filedId, meta)
    return { name: '', sha256: '', data: Buffer.from('') }
  }

  /**
   * Set group information.
   *
   * @param groupId - Target group id
   * @param groupName - Group name
   * @param meta - Extra meta data, optional
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
   * @param meta - Extra meta data, optional
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
   * @param meta - Extra meta data, optional
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
   * @param meta - Extra meta data, optional
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
   * @param meta - Extra meta data, optional
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
   * @param meta - Extra meta data, optional
   *
   * @experimental
   */
  public setGroupKick(groupId: string, userId: string, meta: object = {}) {
    none(this, groupId, userId, meta)
  }
}

export default Api
