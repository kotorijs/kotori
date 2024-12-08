/*
 * @Author: hotaru biyuehuya@gmail.com
 * @Blog: https://hotaru.icu
 * @Date: 2023-07-12 15:42:18
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2024-08-04 14:28:40
 */

export interface BotInfo {
  self_id: number
  connect: number
  heartbeat: number
  status: EventStatusType
}

/* Api */
export type Msg = string | Message | Message[]
export type MessageCqType =
  | 'face'
  | 'record'
  | 'video'
  | 'at'
  | 'share'
  | 'music'
  | 'image'
  | 'reply'
  | 'redbag'
  | 'poke'
  | 'gift'
  | 'forward'
  | 'node'
  | 'xml'
  | 'json'
  | 'cardimage'
  | 'tts'
export type MessageDataType =
  | MessageFace
  | MessageRecord
  | MessageVideo
  | MessageAt
  | MessageShare
  | MessageMusic
  | MessageImage
  | MessageReply
  | MessageRedbag
  | MessagePoke
  | MessageGift
  | MessageForward
  | MessageNode
  | MessageXml
  | MessageJson
  | MessageCardImage
  | MessageTts
export interface Message {
  type: MessageCqType
  data: MessageDataType
}

export type MessageFaceId =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24
  | 25
  | 26
  | 27
  | 28
  | 29
  | 30
  | 31
  | 32
  | 33
  | 34
  | 35
  | 36
  | 37
  | 38
  | 39
  | 40
  | 41
  | 42
  | 43
  | 44
  | 45
  | 46
  | 47
  | 48
  | 49
  | 50
  | 51
  | 52
  | 53
  | 54
  | 55
  | 56
  | 57
  | 58
  | 59
  | 60
  | 61
  | 62
  | 63
  | 64
  | 65
  | 66
  | 67
  | 68
  | 69
  | 70
  | 71
  | 72
  | 73
  | 74
  | 75
  | 76
  | 77
  | 78
  | 79
  | 80
  | 81
  | 82
  | 83
  | 84
  | 85
  | 86
  | 87
  | 88
  | 89
  | 90
  | 91
  | 92
  | 93
  | 94
  | 95
  | 96
  | 97
  | 98
  | 99
  | 100
  | 101
  | 102
  | 103
  | 104
  | 105
  | 106
  | 107
  | 108
  | 109
  | 110
  | 111
  | 112
  | 113
  | 114
  | 115
  | 116
  | 117
  | 118
  | 119
  | 120
  | 121
  | 122
  | 123
  | 124
  | 125
  | 126
  | 127
  | 128
  | 129
  | 130
  | 131
  | 132
  | 133
  | 134
  | 135
  | 136
  | 137
  | 138
  | 139
  | 140
  | 141
  | 142
  | 143
  | 144
  | 145
  | 146
  | 147
  | 148
  | 149
  | 150
  | 151
  | 152
  | 153
  | 154
  | 155
  | 156
  | 157
  | 158
  | 159
  | 160
  | 161
  | 162
  | 163
  | 164
  | 165
  | 166
  | 167
  | 168
  | 169
  | 170
  | 171
  | 172
  | 173
  | 174
  | 175
  | 176
  | 177
  | 178
  | 179
  | 180
  | 181
  | 182
  | 183
  | 184
  | 185
  | 186
  | 187
  | 188
  | 189
  | 190
  | 191
  | 192
  | 193
  | 194
  | 195
  | 196
  | 197
  | 198
  | 199
  | 200
  | 201
  | 202
  | 203
  | 204
  | 205
  | 206
  | 207
  | 208
  | 209
  | 210
  | 211
  | 212
  | 213
  | 214
  | 215
  | 216
  | 217
  | 218
  | 219
  | 220
  | 221

export interface MessageFace {
  id: MessageFaceId
}

export interface MessageRecordFile {
  file: string
  magic?: 0 | 1
}

export interface MessageRecordUrl {
  file: string
  url: string
  cache?: 0 | 1
  proxy?: 0 | 1
  timeout?: number
}

export type MessageRecord = MessageRecordFile | MessageRecordUrl

export interface MessageVideo {
  file: string
  cover?: string
  c?: 1 | 2 | 3
}

export interface MessageAt {
  qq: 'all' | string | number
  name?: string
}

export interface MessageShare {
  url: string
  title: string
  content?: string
  image?: string
}

export interface MessageMusic {
  type: 'qq' | '163' | 'xm'
  id: string
}

export interface MessageMusicCustom {
  type: 'custom'
  url: string
  audio: string
  title: string
  content?: string
  image?: string
}

export interface MessageImage {
  file: string
  type?: 'flash' | 'show' | 'normal'
  subType?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 13
  url?: string
  cache?: 0 | 1
  id?: 40000 | 40001 | 40002 | 40003 | 40004 | 40005
  c?: 1 | 2 | 3
}

export interface MessageReply {
  id: number
  text: string
  qq?: number
  time?: number
  seq?: number
}

export interface MessageRedbag {
  title: string
}

export interface MessagePoke {
  qq: number
}

export interface MessageGift {
  qq: number
  id: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13
}

export interface MessageForward {
  id: string
}

export interface MessageNodeCustom {
  name: string
  uin: number
  content: Message
  seq: Message
}

export type MessageNode =
  | {
      id: number
    }
  | MessageNodeCustom

export interface MessageXml {
  data: string
  resid?: number | '' | null
}

export interface MessageJson extends MessageXml {
  resid?: number
}

export interface MessageCardImage {
  file: string
  minwidth: number
  minheight: number
  maxwidth: number
  maxheight: number
  source: string
  icon?: string
}

export interface MessageTts {
  text: string
}

export interface ApiInvitedRequest {
  request_id: number
  invitor_uin: number
  invitor_nick: number
  group_id: number
  group_name: string
  checked: boolean
  actor: number
}

export interface ApiJoinRequest extends ApiInvitedRequest {
  message: string
}

/* Event */
export type EventHandle = () => void
export type EventPostType = 'message' | 'message_sent' | 'request' | 'notice' | 'meta_event'
export type EventMessageType = 'private' | 'group'
export type EventSubType =
  | 'private'
  | 'normal'
  | 'anonymous'
  | 'group_self'
  | 'group'
  | 'notice'
  | 'connect'
  | 'approve'
  | 'add'
  | 'invite'
  | 'leave'
  | 'kick'
  | 'kick_me'
  | 'set'
  | 'unset'
  | 'ban'
  | 'lift_ban'
  | 'poke'
export type EventRequestType = 'private' | 'group'
export type EventNoticeType =
  | 'group_upload'
  | 'group_admin'
  | 'group_decrease'
  | 'group_increase'
  | 'group_ban'
  | 'private_add'
  | 'group_recall'
  | 'private_recall'
  | 'group_card'
  | 'offline_file'
  | 'client_status'
  | 'essence'
  | 'notify'
export type EventNoticeNotifySubType = 'honor' | 'poke' | 'lucky_king' | 'title'
export type EventMetaEventsList = 'lifecycle' | 'heartbeat'

export type EvenetSenderRoleType = 'owner' | 'admin' | 'member'

export interface EventSenderType {
  user_id: number
  nickname: string
  sex: 'male' | 'female' | 'unknown'
  age: number
  group_id?: number
  card?: string
  area?: string
  level?: string
  role?: EvenetSenderRoleType
  title?: string
}

export interface EventStatusType {
  app_initialized: boolean
  app_enabled: boolean
  plugins_good: boolean | null
  app_good: boolean
  online: boolean
  stat: EventStatType
}

export interface EventStatType {
  packet_received: number
  packet_sent: number
  packet_lost: number
  message_received: number
  message_sent: number
  disconnect_times: number
  lost_times: number
  last_message_time: number
}

export type EventDataType = {
  post_type?: EventPostType
  message_type?: EventMessageType
  sub_type?: EventSubType
  request_type?: EventRequestType
  notice_type?: EventNoticeType
  notice_notify_subtype?: EventNoticeNotifySubType
  meta_event_type?: EventMetaEventsList
  time: number
  self_id: number
  message_: Message
  message: string
  message_id: number
  raw_message: string
  user_id: number
  group_id?: number
  operator_id?: number
  target_id?: number
  duration?: number
  sender: EventSenderType
  comment?: string
  flag?: string
  status: EventStatusType
  font: number | 0
  data?: Omit<EventDataType, 'data'>
}
