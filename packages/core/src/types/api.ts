/** Response for sending message */
export interface SendMessageResponse {
  /** Message id */
  messageId: string
  /** Send time (milliseconds timestamp) */
  time: number
}

/** Response for bot self information */
export interface SelfInfoResponse {
  /** User id */
  userId: string
  /** User name or nickname */
  username: string
  /** The display name, or empty string if none */
  userDisplayname: string
}

/** Response for user information */
export interface UserInfoResponse extends SelfInfoResponse {
  /** The remark name set set by current bot account, or empty string if none */
  userRemark: string
}

/** Response for group information */
export interface GroupInfoResponse {
  /** Group id */
  groupId: string
  /** Group name */
  groupName: string
}

/** Response for guild information */
export interface GuildInfoResponse {
  /** Guild id */
  guildId: string
  /** Guild name */
  guildName: string
}

/** Response for channel information */
export interface ChannelInfoResponse {
  /** Channel id */
  channelId: string
  /** Channel name */
  channelName: string
}

/** Response for file upload */
export interface UploadFileResponse {
  /** File id */
  filedId: string
}

/** Response for file get */
export interface GetFileResponse {
  /** File name */
  name: string
  /** File data (origin binary)'s SHA256 checksum, all lowercase, optional  */
  sha256?: string
}

/** Response for file get url */
export interface GetFileUrlResponse extends GetFileResponse {
  /** File url */
  url: string
  /** File download url headers, or empty object if none */
  headers: Record<string, string>
}

/** Response for file get path */
export interface GetFilePathResponse extends GetFileResponse {
  /** File path */
  path: string
}

/** Response for file get data */
export interface GetFileDataResponse extends GetFileResponse {
  /** File data */
  data: Buffer
}
