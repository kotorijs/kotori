import type { Session } from '../components'
import type { Message, MessageScope } from './message'

declare module './events' {
  interface EventsMapping {
    on_message(session: Session<EventDataPrivateMsg | EventDataGroupMsg | EventDataChannelMsg>): void
    /**
     * Session event when message deleted.
     *
     * @param session - Session instance
     */
    on_message_delete(
      session: Session<EventDataPrivateMsgDelete | EventDataGroupMsgDelete | EventDataChannelMsgDelete>
    ): void

    /**
     * Session event when friend increase.
     *
     * @param session - Session instance
     */
    on_friend_increase(session: Session<EventDataFriendIncrease>): void
    /**
     * Session event when friend decrease.
     *
     * @param session - Session instance
     */
    on_friend_decrease(session: Session<EventDataFriendDecrease>): void
    /**
     * Session event when group member increase.
     *
     * @param session - Session instance
     */
    on_group_increase(session: Session<EventDataGroupIncrease>): void
    /**
     * Session event when group member decrease.
     *
     * @param session - Session instance
     */
    on_group_decrease(session: Session<EventDataGroupDecrease>): void
    /**
     * Session event when guild member decrease.
     *
     * @param session - Session instance
     */
    on_guild_increase(session: Session<EventDataGuildIncrease>): void
    /**
     * Session event when guild member increase.
     *
     * @param session - Session instance
     */
    on_guild_decrease(session: Session<EventDataGuildDecrease>): void
    /**
     * Session event when channel increase.
     *
     * @param session - Session instance
     */
    on_channel_increase(session: Session<EventDataChannelIncrease>): void
    /**
     * Session event when channel decrease.
     *
     * @param session - Session instance
     */
    on_channel_decrease(session: Session<EventDataChannelDecrease>): void
    /**
     * Session event when message edited.
     *
     * @param session - Session instance
     *
     * @experimental
     */
    on_request(session: Session<EventDataFriendRequest | EventDataGroupRequest>): void
    /**
     * Session event when group admin changed.
     *
     * @param session - Session instance
     *
     * @experimental
     */
    on_group_admin(session: Session<EventDataGroupAdmin>): void
    /**
     * Session event when group ban changed.
     *
     * @param session - Session instance
     *
     * @experimental
     */
    on_group_ban(session: Session<EventDataGroupBan>): void
    /**
     * Session event when group member changed.
     *
     * @param session - Session instance
     *
     * @experimental
     */
    on_group_whole_ban(session: Session<EventDataGroupWholeBan>): void
    /**
     * @see {on_message_delete}
     *
     * @deprecated
     */
    on_delete(session: Session<EventDataPrivateMsgDelete | EventDataGroupMsgDelete | EventDataChannelMsgDelete>): void
  }
}

interface SessionSender {
  nickname: string
}

/** Session event data api base */
export interface EventDataApiBase<T extends MessageScope = MessageScope> {
  /** Message type */
  type: T
  /** Message time (milliseconds timestamp) */
  time: number
  /** Message id if exists */
  messageId?: string
  /** User id if exists */
  userId?: string
  /** Operator id if exist */
  operatorId?: string
  /** Group id if exist */
  groupId?: string
  /** Channel id if exist */
  channelId?: string
  /** Guild id if exist */
  guildId?: string
  /** Message meta data */
  meta?: object
  /** @deprecated */
  sender?: SessionSender
}

/** Session event data for received private message */
export interface EventDataPrivateMsg extends EventDataApiBase<MessageScope.PRIVATE> {
  /** User id who sent message */
  userId: string
  /** Message id */
  messageId: string
  /** Message content */
  message: Message
  /** Message plain text content, maybe empty */
  messageAlt: string
  /** @deprecated */
  sender: SessionSender
}

/** Session event data for received group message */
export interface EventDataGroupMsg extends EventDataApiBase<MessageScope.GROUP> {
  /** User id who sent message */
  userId: string
  /** Message id */
  messageId: string
  /** Message content */
  message: Message
  /** Message plain text content, maybe empty */
  messageAlt: string
  /** Group id */
  groupId: string
  /** @deprecated */
  sender: SessionSender & { role: 'owner' | 'admin' | 'member' }
}

/** Session event data for received channel message */
export interface EventDataChannelMsg extends EventDataApiBase<MessageScope.CHANNEL> {
  /** User id who sent message */
  userId: string
  /** Message id */
  messageId: string
  /** Message content */
  message: Message
  /** Message plain text content, maybe empty */
  messageAlt: string
  /** Channel id */
  channelId: string
  /** Guild id */
  guildId: string
  /** @deprecated */
  sender: SessionSender
}

/** Session event data for deleted private message */
export interface EventDataPrivateMsgDelete extends EventDataApiBase<MessageScope.PRIVATE> {
  /** User id who be deleted message */
  userId: string
  messageId: string
}

/** Session event data for deleted group message */
export interface EventDataGroupMsgDelete extends EventDataApiBase<MessageScope.GROUP> {
  /** User id who be deleted message */
  userId: string
  /** Message id */
  messageId: string
  /** Operator id, if it don't equal to `UserId` so message was deleted by the group manger  */
  operatorId: string
  /** Group id */
  groupId: string
}

/** Session event data for deleted channel message */
export interface EventDataChannelMsgDelete extends EventDataApiBase<MessageScope.CHANNEL> {
  /** User id who be deleted message */
  userId: string
  /** Message id */
  messageId: string
  /** Operator id, if it don't equal to `UserId` so message was deleted by the group manger  */
  operatorId: string
  /** Channel id */
  channelId: string
  /** Guild id */
  guildId: string
}

/** Session event data for friend increase */
export interface EventDataFriendIncrease extends EventDataApiBase<MessageScope.PRIVATE> {
  /** User id who increased friend */
  userId: string
}

/** Session event data for friend decrease */
export interface EventDataFriendDecrease extends EventDataApiBase<MessageScope.PRIVATE> {
  /** User id who decreased friend */
  userId: string
}

/** Session event data for group increase */
export interface EventDataGroupIncrease extends EventDataApiBase<MessageScope.GROUP> {
  /** User id who increased member */
  userId: string
  /** Operator id, if it don't equal to `UserId` so member was invited by the group member */
  operatorId: string
  /** Group id */
  groupId: string
}

/** Session event data for group decrease */
export interface EventDataGroupDecrease extends EventDataApiBase<MessageScope.GROUP> {
  /** User id who decreased member */
  userId: string
  /** Operator id, if it don't equal to `UserId` so member was kicked by the group manger */
  operatorId: string
  /** Group id */
  groupId: string
}

/** Session event data for guild increase */
export interface EventDataGuildIncrease extends EventDataApiBase<MessageScope.CHANNEL> {
  /** User id who increased member */
  userId: string
  /** Operator id, if it don't equal to `UserId` so member was invited by the group member */
  operatorId: string
  /** Channel id */
  channelId: string
  /** Guild id */
  guildId: string
}

/** Session event data for guild decrease */
export interface EventDataGuildDecrease extends EventDataApiBase<MessageScope.CHANNEL> {
  /** User id who decreased member */
  userId: string
  /** Operator id, if it don't equal to `UserId` so member was kicked by the group manger */
  operatorId: string
  /** Channel id */
  channelId: string
  /** Guild id */
  guildId: string
}

/** Session event data for channel increase */
export interface EventDataChannelIncrease extends EventDataApiBase<MessageScope.CHANNEL> {
  /** User id who increased member */
  userId: string
  /** Operator id, if it don't equal to `UserId` so member was invited by the group member */
  operatorId: string
  /** Channel id */
  channelId: string
  /** Guild id */
  guildId: string
}

/** Session event data for channel decrease */
export interface EventDataChannelDecrease extends EventDataApiBase<MessageScope.CHANNEL> {
  /** User id who decreased member */
  userId: string
  /** Operator id, if it don't equal to `UserId` so member was kicked by the group manger */
  operatorId: string
  /** Channel id */
  channelId: string
  /** Guild id */
  guildId: string
}

/** Session event data for friend request.
 *
 * @experimental
 */
export interface EventDataFriendRequest extends EventDataApiBase<MessageScope.PRIVATE> {
  /** User id who requested friend */
  userId: string
  /** Requested Comment */
  comment: string
  /**
   * Handle the request
   *
   * @param approved - Whether to approve the request, default is true
   * @param remark - Remark displayname of friend, default don't remark (valid when approved)
   */
  approve(approved?: boolean, remark?: string): void
}

/** Session event data for group request.
 *
 * @experimental
 */
export interface EventDataGroupRequest extends EventDataApiBase<MessageScope.GROUP> {
  /** User id who requested group */
  userId: string
  /** Operator id, if it don't equal to `UserId` so member was invited by the group member */
  operatorId: string
  /** Group id */
  groupId: string
  /** Requested Comment */
  comment: string
  /**
   * Handle the request
   *
   * @param approved - Whether to approve the request, default is true
   * @param reason - Refused reason, default is empty string (valid when refused)
   */
  approve(approved?: boolean, reason?: string): void
}

/** Session event data when group admin changed.
 *
 * @experimental
 */
export interface EventDataGroupAdmin extends EventDataApiBase<MessageScope.GROUP> {
  /** User id who be set or unset admin */
  userId: string
  /** Operation, be set or unset */
  operation: 'set' | 'unset'
  /** Group id */
  groupId: string
}

/** Session event data when group ban changed
 *
 * @experimental
 */
export interface EventDataGroupBan extends EventDataApiBase<MessageScope.GROUP> {
  /** User id who be banned */
  userId: string
  /** Operator id */
  operatorId: string
  /** Ban duration (seconds), if equal to 0, it means unban */
  duration: number
  /** Group id */
  groupId: string
}

/** Session event when group whole ban changed */
export interface EventDataGroupWholeBan extends EventDataApiBase<MessageScope.CHANNEL> {
  userId: never
  /** Operator id */
  operatorId: string
  /** Operation, set or unset whole ban */
  operation: 'set' | 'unset'
  /** Group id */
  groupId: string
}
