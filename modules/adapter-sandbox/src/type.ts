import { Tsu } from 'kotori-bot'

interface ActionSendPrivateMsg {
  action: 'send_private_msg'
  message: string // 消息内容
  userId: string // 好友 ID
}

interface ActionSendGroupMsg {
  action: 'send_group_msg'
  message: string // 消息内容
  groupId: string // 群组 ID
}

interface ActionDeleteMsg {
  action: 'delete_msg'
  messageId: string // 消息 ID
}

interface ActionGetSelfInfo {
  action: 'get_self_info'
}

interface ActionGetUserInfo {
  action: 'get_user_info'
  userId: string
}

interface ActionGetFriendList {
  action: 'get_friend_list'
}

interface ActionGetGroupInfo {
  action: 'get_group_info'
  groupId: string
}

interface ActionGetGroupList {
  action: 'get_group_list'
}

interface ActionGetGroupMemberInfo {
  action: 'get_group_member_info'
  groupId: string
  userId: string
}

interface ActionGetGroupMemberList {
  action: 'get_group_member_list'
  groupId: string
}

interface ActionSetGroupName {
  action: 'set_group_name'
  groupId: string // 群组 ID
  groupName: string // 群名
}

interface ActionSetGroupLeave {
  action: 'leave_group'
  groupId: string // 群组 ID
}

interface ActionSetGroupAdmin {
  action: 'set_group_admin'
  groupId: string // 群组 ID
  userId: string // 用户 ID
  enable: boolean // 是否启用
}

interface ActionSetGroupCard {
  action: 'set_group_card'
  groupId: string // 群组 ID
  userId: string // 用户 ID
  card: string // 名片内容
}

interface ActionSetGroupKick {
  action: 'set_group_kick'
  groupId: string // 群组 ID
  userId: string // 用户 ID
}

interface ActionSetGroupBan {
  action: 'set_group_ban'
  groupId: string // 群组 ID
  userId: string // 用户 ID
  time: number // 禁言时间，单位秒
}

interface ActionSetGroupWholeBan {
  action: 'set_group_whole_ban'
  groupId: string // 群组 ID
  enable: boolean // 是否启用
}

interface ActionOnDataError {
  action: 'on_data_error'
  error: string // 错误信息（来自 `Tsukiko` 的数据解析器错误信息）
}

export type ActionList =
  | ActionSendPrivateMsg
  | ActionSendGroupMsg
  | ActionDeleteMsg
  | ActionGetSelfInfo
  | ActionGetUserInfo
  | ActionGetFriendList
  | ActionGetGroupInfo
  | ActionGetGroupList
  | ActionGetGroupMemberInfo
  | ActionGetGroupMemberList
  | ActionSetGroupName
  | ActionSetGroupLeave
  | ActionSetGroupAdmin
  | ActionSetGroupCard
  | ActionSetGroupKick
  | ActionSetGroupBan
  | ActionSetGroupWholeBan
  | ActionOnDataError

const eventDataPrivateMsgSchema = Tsu.Object({
  event: Tsu.Literal('on_message'),
  type: Tsu.Literal(0),
  message: Tsu.String(),
  messageAlt: Tsu.String(),
  userId: Tsu.String(),
  sender: Tsu.Object({
    nickname: Tsu.String()
  }),
  time: Tsu.Number()
})

const eventDataGroupMsgSchema = Tsu.Object({
  event: Tsu.Literal('on_message'),
  type: Tsu.Literal(1),
  message: Tsu.String(),
  messageAlt: Tsu.String(),
  userId: Tsu.String(),
  sender: Tsu.Object({
    nickname: Tsu.String(),
    role: Tsu.Enum(Tsu.Literal('owner'), Tsu.Literal('admin'), Tsu.Literal('member'))
  }),
  time: Tsu.Number(),
  groupId: Tsu.String()
})

const eventDataChannelMsgSchema = Tsu.Object({
  event: Tsu.Literal('on_message'),
  type: Tsu.Literal(2),
  message: Tsu.String(),
  messageAlt: Tsu.String(),
  userId: Tsu.String(),
  sender: Tsu.Object({
    nickname: Tsu.String()
  }),
  time: Tsu.Number(),
  channelId: Tsu.String()
})

const eventDataPrivateMsgDeleteSchema = Tsu.Object({
  event: Tsu.Literal('on_message_delete'),
  type: Tsu.Literal(0),
  userId: Tsu.String(),
  messageId: Tsu.String(),
  time: Tsu.Number()
})

const eventDataGroupMsgDeleteSchema = Tsu.Object({
  event: Tsu.Literal('on_message_delete'),
  type: Tsu.Literal(1),
  userId: Tsu.String(),
  messageId: Tsu.String(),
  operatorId: Tsu.String(),
  groupId: Tsu.String(),
  time: Tsu.Number()
})

const eventDataChannelMsgDeleteSchema = Tsu.Object({
  event: Tsu.Literal('on_message_delete'),
  type: Tsu.Literal(2),
  userId: Tsu.String(),
  messageId: Tsu.String(),
  operatorId: Tsu.String(),
  channelId: Tsu.String(),
  guildId: Tsu.String(),
  time: Tsu.Number()
})

const eventDataFriendIncreaseSchema = Tsu.Object({
  event: Tsu.Literal('on_friend_increase'),
  type: Tsu.Literal(0),
  userId: Tsu.String(),
  time: Tsu.Number()
})

const eventDataFriendDecreaseSchema = Tsu.Object({
  event: Tsu.Literal('on_friend_decrease'),
  type: Tsu.Literal(0),
  userId: Tsu.String(),
  time: Tsu.Number()
})

const eventDataGroupIncreaseSchema = Tsu.Object({
  event: Tsu.Literal('on_group_increase'),
  type: Tsu.Literal(1),
  userId: Tsu.String(),
  operatorId: Tsu.String(),
  groupId: Tsu.String(),
  time: Tsu.Number()
})

const eventDataGroupDecreaseSchema = Tsu.Object({
  event: Tsu.Literal('on_group_decrease'),
  type: Tsu.Literal(1),
  userId: Tsu.String(),
  operatorId: Tsu.String(),
  groupId: Tsu.String(),
  time: Tsu.Number()
})

const eventDataGuildIncreaseSchema = Tsu.Object({
  event: Tsu.Literal('on_guild_increase'),
  type: Tsu.Literal(2),
  userId: Tsu.String(),
  operatorId: Tsu.String(),
  channelId: Tsu.String(),
  guildId: Tsu.String()
})

const eventDataGuildDecreaseSchema = Tsu.Object({
  event: Tsu.Literal('on_guild_decrease'),
  type: Tsu.Literal(2),
  userId: Tsu.String(),
  operatorId: Tsu.String(),
  channelId: Tsu.String(),
  guildId: Tsu.String(),
  time: Tsu.Number()
})

const eventDataChannelIncreaseSchema = Tsu.Object({
  event: Tsu.Literal('on_channel_increase'),
  type: Tsu.Literal(2),
  userId: Tsu.String(),
  operatorId: Tsu.String(),
  channelId: Tsu.String(),
  guildId: Tsu.String(),
  time: Tsu.Number()
})

const eventDataChannelDecreaseSchema = Tsu.Object({
  event: Tsu.Literal('on_channel_decrease'),
  type: Tsu.Literal(2),
  userId: Tsu.String(),
  operatorId: Tsu.String(),
  channelId: Tsu.String(),
  guildId: Tsu.String(),
  time: Tsu.Number()
})

/* Experimental */

const eventDataGroupAdminSchema = Tsu.Object({
  event: Tsu.Literal('on_group_admin'),
  type: Tsu.Literal(1),
  userId: Tsu.String(),
  operation: Tsu.Union(Tsu.Literal('set'), Tsu.Literal('unset')),
  groupId: Tsu.String(),
  time: Tsu.Number()
})

const eventDataGroupBanSchema = Tsu.Object({
  event: Tsu.Literal('on_group_ban'),
  type: Tsu.Literal(1),
  userId: Tsu.String(),
  operatorId: Tsu.String(),
  duration: Tsu.Number(),
  groupId: Tsu.String(),
  time: Tsu.Number()
})

const eventDataGroupWholeBanSchema = Tsu.Object({
  event: Tsu.Literal('on_group_whole_ban'),
  type: Tsu.Literal(1),
  operatorId: Tsu.String(),
  operation: Tsu.Union(Tsu.Literal('set'), Tsu.Literal('unset')),
  groupId: Tsu.String(),
  time: Tsu.Number()
})

export const eventDataSchema = Tsu.Union(
  eventDataPrivateMsgSchema,
  eventDataGroupMsgSchema,
  eventDataChannelMsgSchema,
  eventDataPrivateMsgDeleteSchema,
  eventDataGroupMsgDeleteSchema,
  eventDataChannelMsgDeleteSchema,
  eventDataFriendIncreaseSchema,
  eventDataFriendDecreaseSchema,
  eventDataGroupIncreaseSchema,
  eventDataGroupDecreaseSchema,
  eventDataGuildIncreaseSchema,
  eventDataGuildDecreaseSchema,
  eventDataChannelIncreaseSchema,
  eventDataChannelDecreaseSchema,
  eventDataGroupAdminSchema,
  eventDataGroupBanSchema,
  eventDataGroupWholeBanSchema
)

const sendMessageResponseSchema = Tsu.Object({
  response: Tsu.Literal('send_message_response'),
  messageId: Tsu.String(),
  time: Tsu.Number()
})

const selfInfoResponseSchema = Tsu.Object({
  response: Tsu.Literal('self_info_response'),
  userId: Tsu.String(),
  username: Tsu.String(),
  userDisplayname: Tsu.String()
})

const userInfoResponseSchema = Tsu.Object({
  response: Tsu.Literal('user_info_response'),
  userId: Tsu.String(),
  username: Tsu.String(),
  userDisplayname: Tsu.String(),
  userRemark: Tsu.String()
})

const friendListResponseSchema = Tsu.Array(userInfoResponseSchema)

const groupInfoResponseSchema = Tsu.Object({
  response: Tsu.Literal('group_info_response'),
  groupId: Tsu.String(),
  groupName: Tsu.String()
})

const groupListResponseSchema = Tsu.Array(groupInfoResponseSchema)

const groupMemberInfoResponseSchema = Tsu.Object({
  response: Tsu.Literal('group_member_info_response'),
  userId: Tsu.String(),
  username: Tsu.String(),
  userDisplayname: Tsu.String()
})

const groupMemberListResponseSchema = Tsu.Array(groupMemberInfoResponseSchema)

export const responseSchema = Tsu.Union(
  sendMessageResponseSchema,
  selfInfoResponseSchema,
  userInfoResponseSchema,
  friendListResponseSchema,
  groupInfoResponseSchema,
  groupListResponseSchema,
  groupMemberInfoResponseSchema,
  groupMemberListResponseSchema
)
