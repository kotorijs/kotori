export enum FileType {
  IMAGE = 1,
  VIDEO = 2,
  VOICE = 3,
  FILE = 4
}

export interface ParamsMapping {
  sendGroupMsg: [
    {
      groupId: string
      message: string
      media: { type: FileType; value: string }[]
      msgId?: string
    },
    { id: string; timestamp: number | string }
  ]
  sendPrivateMsg: [
    {
      userId: string
      message: string
      media: { type: FileType; value: string }[]
      msgId?: string
    },
    { id: string; timestamp: number | string }
  ]
  sendChannelMsg: [
    {
      channelId: string
      guildId: string
      content?: string
      image?: string
      msgId?: string
    },
    Message
  ]
  deleteMsg: [
    {
      messageId: string
      groupId?: string
      userId?: string
      channelId?: string
      guildId?: string
    },
    undefined
  ]
}

export enum OpCode {
  DISPATCH = 0,
  HEARTBEAT = 1,
  IDENTIFY = 2,
  RESUME = 6,
  RECONNECT = 7,
  INVALID_SESSION = 9,
  HELLO = 10,
  HEARTBEAT_ACK = 11,
  HTTP_CALLBACK_ACK = 12
}

export interface EventDataList {
  C2C_MESSAGE_CREATE: C2C_MESSAGE_CREATE
  GROUP_AT_MESSAGE_CREATE: GROUP_AT_MESSAGE_CREATE
  DIRECT_MESSAGE_CREATE: DIRECT_MESSAGE_CREATE
  AT_MESSAGE_CREATE: AT_MESSAGE_CREATE
  MESSAGE_CREATE: MESSAGE_CREATE
  GUILD_CREATE: GUILD_CREATE
  GUILD_UPDATE: GUILD_UPDATE
  GUILD_DELETE: GUILD_DELETE
  CHANNEL_CREATE: CHANNEL_CREATE
  CHANNEL_UPDATE: CHANNEL_UPDATE
  CHANNEL_DELETE: CHANNEL_DELETE
  GUILD_MEMBER_ADD: GUILD_MEMBER_ADD
  GUILD_MEMBER_UPDATE: GUILD_MEMBER_UPDATE
  GUILD_MEMBER_REMOVE: GUILD_MEMBER_REMOVE
  GROUP_ADD_ROBOT: GROUP_ADD_ROBOT
  GROUP_DEL_ROBOT: GROUP_DEL_ROBOT
  on_message_REJECT: on_message_REJECT
  on_message_RECEIVE: on_message_RECEIVE
  FRIEND_ADD: FRIEND_ADD
  FRIEND_DEL: FRIEND_DEL
  C2C_MSG_REJECT: C2C_MSG_REJECT
  C2C_MSG_RECEIVE: C2C_MSG_RECEIVE
  READY: Ready
}

export interface Payload<T extends keyof EventDataList> {
  op: OpCode
  d: EventDataList[T]
  s: number
  t: T
}

export type PayloadList = {
  [K in keyof EventDataList]: Payload<K>
}

export type PayloadData = PayloadList[keyof PayloadList]

/* Object */

export interface Message {
  id: string
  channel_id: string
  guild: string
  content: string
  timestamp: string
  edited_timestamp: string
  mention_everyone: string
  author: User
  attachments: MessageAttachment[]
  embeds: MessageEmbed[]
  mentions: User[]
  member: ClassMemberDecoratorContext
  ark: MessageArk
  seq: number
  seq_in_channel: string
  message_reference: MessageReference
}

export interface MessageEmbed {
  title: string
  prompt: string
  thumbnail: MessageEmbedThumbnail
  fields: MessageEmbedField[]
}

export interface MessageEmbedThumbnail {
  url: string
}

export interface MessageEmbedField {
  name: string
}

export interface MessageAttachment {
  url?: string
  content_type?: string
  filename?: string
  height?: number
  width?: number
  size?: number
  id?: string
}

export interface MessageArk {
  template_id: number
  kv: MessageArkKv[]
}

export interface MessageArkKv {
  key: string
  value: string
  obj: MessageArkObj[]
}

export interface MessageArkObj {
  obj_kv: MessageArkObjKv[]
}

export interface MessageArkObjKv {
  key: string
  value: string
}

export interface MessageReference {
  message_id: string
  ignore_get_message_error?: boolean
}

export interface User {
  id: string
  username: string
  avatar: string
  bot: boolean
  union_openid?: string
  union_user_account?: string
}

/* Events */

export interface Ready {
  version: number
  session_id: string
  user: {
    id: string
    username: string
    bot: boolean
  }
  shard: number[]
}

export interface C2C_MESSAGE_CREATE {
  author: {
    user_openid: string
  }
  content: string
  id: string
  timestamp: string
  attachments?: MessageAttachment[]
  message_reference?: MessageReference
}

export interface GROUP_AT_MESSAGE_CREATE {
  author: {
    member_openid: string
  }
  content: string
  group_openid: string
  id: string
  timestamp: string
  attachments?: MessageAttachment[]
  message_reference?: MessageReference
}

export interface DIRECT_MESSAGE_CREATE {
  author: {
    avatar: string
    bot: boolean
    id: string
    username: string
  }
  channel_id: string
  content: string
  id: string
  guild_id: string
  timestamp: string
  attachments?: MessageAttachment[]
  message_reference?: MessageReference
  member?: {
    joined_at: string
    roles: string[]
  }
}

export type AT_MESSAGE_CREATE = DIRECT_MESSAGE_CREATE
export type MESSAGE_CREATE = Message

export interface GUILD_CREATE {
  description: string
  icon: string
  id: string
  joined_at: string
  max_members: number
  member_count: number
  name: string
  op_user_id: string
  owner_id: string
}

export type GUILD_UPDATE = GUILD_CREATE
export type GUILD_DELETE = GUILD_CREATE

export interface CHANNEL_CREATE {
  guild_id: string
  id: string
  name: string
  op_user_id: string
  owner_id: string
  sub_type: number
  type: number
}

export type CHANNEL_UPDATE = CHANNEL_CREATE
export type CHANNEL_DELETE = CHANNEL_CREATE

export interface GUILD_MEMBER_ADD {
  guild_id: string
  joined_at: string
  nick: string
  op_user_id: string
  roles: string[]
  user: User
}

export type GUILD_MEMBER_UPDATE = GUILD_MEMBER_ADD
export type GUILD_MEMBER_REMOVE = GUILD_MEMBER_ADD

export interface GROUP_ADD_ROBOT {
  group_openid: string
  op_member_openid: string
  timestamp: number
}

export type GROUP_DEL_ROBOT = GROUP_ADD_ROBOT
export type on_message_REJECT = GROUP_ADD_ROBOT
export type on_message_RECEIVE = GROUP_ADD_ROBOT

export interface FRIEND_ADD {
  openid: string
  timestamp: number
}

export type FRIEND_DEL = FRIEND_ADD
export type C2C_MSG_REJECT = FRIEND_ADD
export type C2C_MSG_RECEIVE = FRIEND_ADD
