# @kotori-bot/kotori-plugin-adapter-onebot

To test bot for Kotori.

## Config

No configuration is required.

## Supports

### Events

- on_message (exclude `RequestScope.CHANNEL`)
- on_message_delete (exclude `MessageScope.CHANNEL`)
- on_group_increase
- on_group_decrease
- on_group_whole_ban
- on_friend_decrease
- on_friend_increase
- on_group_ban
- on_group_admin

### Api

- sendPrivateMsg
- sendGroupMsg
- deleteMsg
- getUserInfo
- getFriendList
- getGroupInfo
- getGroupList
- getGroupMemberInfo
- getGroupMemberList
- setGroupName
- leaveGroup
- setGroupAdmin
- setGroupCard
- setGroupBan
- setGroupWholeBan
- setGroupKick

### Elements

- text
- mention
- mentionAll
- image
- voice
- audio
- video
- reply
- file

## Reference

- [Kotori Docs](https://kotori.js.org/)
