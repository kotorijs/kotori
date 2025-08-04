import { z } from 'zod'

interface ActionSendPrivateMsg {
  action: 'send_private_msg'
  message: string
  userId: string
}

interface ActionSendGroupMsg {
  action: 'send_group_msg'
  message: string
  groupId: string
}

interface ActionDeleteMsg {
  action: 'delete_msg'
  messageId: string
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
  groupId: string
  groupName: string
}

interface ActionSetGroupLeave {
  action: 'leave_group'
  groupId: string
}

interface ActionSetGroupAdmin {
  action: 'set_group_admin'
  groupId: string
  userId: string
  enable: boolean
}

interface ActionSetGroupCard {
  action: 'set_group_card'
  groupId: string
  userId: string
  card: string
}

interface ActionSetGroupKick {
  action: 'set_group_kick'
  groupId: string
  userId: string
}

interface ActionSetGroupBan {
  action: 'set_group_ban'
  groupId: string
  userId: string
  time: number
}

interface ActionSetGroupWholeBan {
  action: 'set_group_whole_ban'
  groupId: string
  enable: boolean
}

interface ActionOnDataError {
  action: 'on_data_error'
  error: string
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

const eventDataPrivateMsgSchema = z.object({
  event: z.literal('on_message'),
  type: z.literal(0),
  message: z.string(),
  messageAlt: z.string(),
  userId: z.string(),
  sender: z.object({
    nickname: z.string()
  }),
  time: z.number()
})

const eventDataGroupMsgSchema = z.object({
  event: z.literal('on_message'),
  type: z.literal(1),
  message: z.string(),
  messageAlt: z.string(),
  userId: z.string(),
  sender: z.object({
    nickname: z.string(),
    role: z.enum(['owner', 'admin', 'member'])
  }),
  time: z.number(),
  groupId: z.string()
})

const eventDataChannelMsgSchema = z.object({
  event: z.literal('on_message'),
  type: z.literal(2),
  message: z.string(),
  messageAlt: z.string(),
  userId: z.string(),
  sender: z.object({
    nickname: z.string()
  }),
  time: z.number(),
  channelId: z.string()
})

const eventDataPrivateMsgDeleteSchema = z.object({
  event: z.literal('on_message_delete'),
  type: z.literal(0),
  userId: z.string(),
  messageId: z.string(),
  time: z.number()
})

const eventDataGroupMsgDeleteSchema = z.object({
  event: z.literal('on_message_delete'),
  type: z.literal(1),
  userId: z.string(),
  messageId: z.string(),
  operatorId: z.string(),
  groupId: z.string(),
  time: z.number()
})

const eventDataChannelMsgDeleteSchema = z.object({
  event: z.literal('on_message_delete'),
  type: z.literal(2),
  userId: z.string(),
  messageId: z.string(),
  operatorId: z.string(),
  channelId: z.string(),
  guildId: z.string(),
  time: z.number()
})

const eventDataFriendIncreaseSchema = z.object({
  event: z.literal('on_friend_increase'),
  type: z.literal(0),
  userId: z.string(),
  time: z.number()
})

const eventDataFriendDecreaseSchema = z.object({
  event: z.literal('on_friend_decrease'),
  type: z.literal(0),
  userId: z.string(),
  time: z.number()
})

const eventDataGroupIncreaseSchema = z.object({
  event: z.literal('on_group_increase'),
  type: z.literal(1),
  userId: z.string(),
  operatorId: z.string(),
  groupId: z.string(),
  time: z.number()
})

const eventDataGroupDecreaseSchema = z.object({
  event: z.literal('on_group_decrease'),
  type: z.literal(1),
  userId: z.string(),
  operatorId: z.string(),
  groupId: z.string(),
  time: z.number()
})

const eventDataGuildIncreaseSchema = z.object({
  event: z.literal('on_guild_increase'),
  type: z.literal(2),
  userId: z.string(),
  operatorId: z.string(),
  channelId: z.string(),
  guildId: z.string()
})

const eventDataGuildDecreaseSchema = z.object({
  event: z.literal('on_guild_decrease'),
  type: z.literal(2),
  userId: z.string(),
  operatorId: z.string(),
  channelId: z.string(),
  guildId: z.string(),
  time: z.number()
})

const eventDataChannelIncreaseSchema = z.object({
  event: z.literal('on_channel_increase'),
  type: z.literal(2),
  userId: z.string(),
  operatorId: z.string(),
  channelId: z.string(),
  guildId: z.string(),
  time: z.number()
})

const eventDataChannelDecreaseSchema = z.object({
  event: z.literal('on_channel_decrease'),
  type: z.literal(2),
  userId: z.string(),
  operatorId: z.string(),
  channelId: z.string(),
  guildId: z.string(),
  time: z.number()
})

const eventDataGroupAdminSchema = z.object({
  event: z.literal('on_group_admin'),
  type: z.literal(1),
  userId: z.string(),
  operation: z.union([z.literal('set'), z.literal('unset')]),
  groupId: z.string(),
  time: z.number()
})

const eventDataGroupBanSchema = z.object({
  event: z.literal('on_group_ban'),
  type: z.literal(1),
  userId: z.string(),
  operatorId: z.string(),
  duration: z.number(),
  groupId: z.string(),
  time: z.number()
})

const eventDataGroupWholeBanSchema = z.object({
  event: z.literal('on_group_whole_ban'),
  type: z.literal(1),
  operatorId: z.string(),
  operation: z.union([z.literal('set'), z.literal('unset')]),
  groupId: z.string(),
  time: z.number()
})

export const eventDataSchema = z.union([
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
])

const sendMessageResponseSchema = z.object({
  response: z.literal('send_message_response'),
  messageId: z.string(),
  time: z.number()
})

const selfInfoResponseSchema = z.object({
  response: z.literal('self_info_response'),
  userId: z.string(),
  username: z.string(),
  userDisplayname: z.string()
})

const userInfoResponseSchema = z.object({
  response: z.literal('user_info_response'),
  userId: z.string(),
  username: z.string(),
  userDisplayname: z.string(),
  userRemark: z.string()
})

const friendListResponseSchema = z.array(userInfoResponseSchema)

const groupInfoResponseSchema = z.object({
  response: z.literal('group_info_response'),
  groupId: z.string(),
  groupName: z.string()
})

const groupListResponseSchema = z.array(groupInfoResponseSchema)

const groupMemberInfoResponseSchema = z.object({
  response: z.literal('group_member_info_response'),
  userId: z.string(),
  username: z.string(),
  userDisplayname: z.string()
})

const groupMemberListResponseSchema = z.array(groupMemberInfoResponseSchema)

export const responseSchema = z.union([
  sendMessageResponseSchema,
  selfInfoResponseSchema,
  userInfoResponseSchema,
  friendListResponseSchema,
  groupInfoResponseSchema,
  groupListResponseSchema,
  groupMemberInfoResponseSchema,
  groupMemberListResponseSchema
])
