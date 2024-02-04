export const enum OpCode {
  DISPATCH,
  HEARTBEAT,
  IDENTIFY,
  RESUME = 6,
  RECONNECT,
  INVALID_SESSION = 9,
  HELLO,
  HEARTBEAT_ACK,
  HTTP_CALLBACK_ACK,
}

export interface EventDataList {
  C2C_MESSAGE_CREATE: C2C_MESSAGE_CREATE;
  GROUP_AT_MESSAGE_CREATE: GROUP_AT_MESSAGE_CREATE;
  DIRECT_MESSAGE_CREATE: DIRECT_MESSAGE_CREATE;
  AT_MESSAGE_CREATE: AT_MESSAGE_CREATE;
  MESSAGE_CREATE: MESSAGE_CREATE;
  GUILD_CREATE: GUILD_CREATE;
  GUILD_UPDATE: GUILD_UPDATE;
  GUILD_DELETE: GUILD_DELETE;
  CHANNEL_UPDATE: CHANNEL_UPDATE;
  CHANNEL_DELETE: CHANNEL_DELETE;
  GUILD_MEMBER_ADD: GUILD_MEMBER_ADD;
  GUILD_MEMBER_UPDATE: GUILD_MEMBER_UPDATE;
  GUILD_MEMBER_REMOVE: GUILD_MEMBER_REMOVE;
  GROUP_ADD_ROBOT: GROUP_ADD_ROBOT;
  GROUP_DEL_ROBOT: GROUP_DEL_ROBOT;
  GROUP_MSG_REJECT: GROUP_MSG_REJECT;
  GROUP_MSG_RECEIVE: GROUP_MSG_RECEIVE;
  FRIEND_ADD: FRIEND_ADD;
  FRIEND_DEL: FRIEND_DEL;
  C2C_MSG_REJECT: C2C_MSG_REJECT;
  C2C_MSG_RECEIVE: C2C_MSG_RECEIVE;
  READY: Ready;
}

export interface Payload<T extends keyof EventDataList> {
  op: OpCode;
  d: EventDataList[T];
  s: number;
  t: T;
}

export type PayloadList = {
  [K in keyof EventDataList]: Payload<K>;
};

export type PlayloadData = PayloadList[keyof PayloadList];

/* Object */

interface Message {
  id: string;
  channel_id: string;
  guild: string;
  content: string;
  timestamp: string;
  edited_timestamp: string;
  mention_everyone: string;
  author: User;
  attachments: MessageAttachment[];
  embeds: MessageEmbed[];
  mentions: User[];
  member: ClassMemberDecoratorContext;
  ark: MessageArk;
  seq: number;
  seq_in_channel: string;
  message_reference: string;
}

interface MessageEmbed {
  title: string;
  prompt: string;
  thumbnail: MessageEmbedThumbnail;
  fields: MessageEmbedField[];
}

interface MessageEmbedThumbnail {
  url: string;
}

interface MessageEmbedField {
  name: string;
}

type MessageAttachment = MessageEmbedThumbnail;

interface MessageArk {
  template_id: number;
  kv: MessageArkKv[];
}

interface MessageArkKv {
  key: string;
  value: string;
  obj: MessageArkObj[];
}

interface MessageArkObj {
  obj_kv: MessageArkObjKv[];
}

interface MessageArkObjKv {
  key: string;
  value: string;
}

export interface MessageReference {
  message_id: string;
  ignore_get_message_error: boolean;
}
/* 
interface MessageMarkdownParams {
	key: string;
	values: string[];
}

interface MessageDelete {
	message: Message;
	op_user: User;
}

interface MessageAudited {
	audit_id: string;
	message_id: string;
	guild_id: string;
	channel_id: string;
	audit_time: number;
	create_time: number;
	seq_in_channel: string;
}

interface Member {
	user: User;
	nick: string;
	roles: string[];
	joined_at: number;
}

interface MemberWithGuildID extends Member {
	guild_id: string;
} */

interface User {
  id: string;
  username: string;
  avatar: string;
  bot: boolean;
  union_openid?: string;
  union_user_account?: string;
}

/* Events */

interface Ready {
  version: number;
  session_id: string;
  user: {
    id: string;
    username: string;
    bot: boolean;
  };
  shard: number[];
}

interface C2C_MESSAGE_CREATE {
  author: {
    user_openid: string;
  };
  content: string;
  id: string;
  timestamp: string;
}

interface GROUP_AT_MESSAGE_CREATE {
  author: {
    member_openid: string;
  };
  content: string;
  group_openid: string;
  id: string;
  timestamp: string;
}

type DIRECT_MESSAGE_CREATE = Message;
type AT_MESSAGE_CREATE = Message;
type MESSAGE_CREATE = Message;

interface GUILD_CREATE {
  description: string;
  icon: string;
  id: string;
  joined_at: string;
  max_members: number;
  member_count: number;
  name: string;
  op_user_id: string;
  owner_id: string;
}

type GUILD_UPDATE = GUILD_CREATE;
type GUILD_DELETE = GUILD_CREATE;

interface CHANNEL_CREATE {
  guild_id: string;
  id: string;
  name: string;
  op_user_id: string;
  owner_id: string;
  sub_type: number;
  type: number;
}

type CHANNEL_UPDATE = CHANNEL_CREATE;
type CHANNEL_DELETE = CHANNEL_CREATE;

interface GUILD_MEMBER_ADD {
  guild_id: string;
  joined_at: string;
  nick: string;
  op_user_id: string;
  roles: string[];
  user: User;
}

type GUILD_MEMBER_UPDATE = GUILD_MEMBER_ADD;
type GUILD_MEMBER_REMOVE = GUILD_MEMBER_ADD;

interface GROUP_ADD_ROBOT {
  group_openid: string;
  op_member_openid: string;
  timestamp: number;
}

type GROUP_DEL_ROBOT = GROUP_ADD_ROBOT;
type GROUP_MSG_REJECT = GROUP_ADD_ROBOT;
type GROUP_MSG_RECEIVE = GROUP_ADD_ROBOT;

interface FRIEND_ADD {
  openid: string;
  timestamp: number;
}

type FRIEND_DEL = FRIEND_ADD;
type C2C_MSG_REJECT = FRIEND_ADD;
type C2C_MSG_RECEIVE = FRIEND_ADD;
