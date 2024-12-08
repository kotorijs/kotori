# Sandbox Data Interaction By WebSocket

## Events

Events 由前端通过 `ws.send()` 方法向后端上报，每个 Events 对应前端内部自己的沙盒事件。

所有事件的接收者均为沙盒中当前登录用户，不应收到其它用户的事件，如：沙盒中有 `U1`、`U2`、`U3` 三个用户与 `G1`、`G2` 两个群组，`U1` 加入了 `G1` 群组，`U2` 加入了 `G2` 群组，`U3` 两个群组均加入，当前登录用户为 `U1`。此时 `U3` 向 `G2` 群组发送消息，`U1` 不在 `G2` 群组因此无法收到事件，当 `U3` 向 `G1` 群组发送消息时，`U1` 收到事件，前端向后端上报事件数据。

---

基础数据结构：

其中 `type` 为消息类型，`0` 为私聊消息，`1` 为群聊消息

```typescript
/** Session event data api base */
export interface EventDataBase<T extends 0 | 1 | 2> {
  /* Event type */
  event: string
  /** Message type */
  type: T
  /** Message time (milliseconds timestamp) */
  time: number
}
```

当消息类型为群聊时会有额外数据：

```typescript
interface SessionSender {
  nickname: string
}
```

### on_message

当收到消息时触发。

- 私聊

```typescript
interface EventDataPrivateMsg extends EventDataBase<0> {
  event: "on_message"
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
```

参考：

```json
{
  "event": "on_message",
  "time": 1669688800,
  "type": 0,
  "messageId": "123456789",
  "message": "Hello, World!",
  "messageAlt": "Hello, World!",
  "userId": "123456789",
  "sender": {
    "nickname": "User1",
  }
}
```

- 群聊

当收到群聊消息时触发。

```typescript
interface EventDataGroupMsg extends EventDataBase<1> {
  event: "on_message"
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
```

参考：

```json
{
  "event": "on_message",
  "time": 1669688800,
  "type": 1,
  "messageId": "123456789",
  "message": "Hello, World!",
  "messageAlt": "Hello, World!",
  "userId": "123456789",
  "groupId": "987654321",
  "sender": {
    "nickname": "User1",
    "role": "owner"
  }
}
```

### on_message_delete

当撤回消息时触发。

- 私聊

```typescript
interface EventDataRecall extends EventDataBase<0> {
  event: "on_message_delete"
  /** User id who be deleted message */
  userId: string
  messageId: string
}
```

参考：

```json
{
  "event": "on_message_delete",
  "time": 1669688800,
  "type": 0,
  "userId": "123456789",
  "messageId": "123456789"
}
```

- 群聊

```typescript
interface EventDataGroupRecall extends EventDataBase<1> {
  /** User id who be deleted message */
  userId: string
  /** Message id */
  messageId: string
  /** Operator id, if it don't equal to `UserId` so message was deleted by the group manger  */
  operatorId: string
  /** Group id */
  groupId: string
}
```

参考：

```json
{
  "event": "on_message_delete",
  "time": 1669688800,
  "type": 1,
  "userId": "123456789",
  "messageId": "123456789",
  "operatorId": "987654321",
  "groupId": "987654321"
}
```

### on_friend_increase & on_friend_decrease

当好友列表增加或减少时触发。

```typescript
interface EventDataFriendIncrease extends EventDataBase<0> {
  event: "on_friend_increase" | "on_friend_decrease"
  /** User id who increased friend */
  userId: string
}
```

参考：

```json
{
  "event": "on_friend_increase",
  "time": 1669688800,
  "type": 0,
  "userId": "123456789"
}
```

### on_group_increase & on_group_decrease

当群成员增加或减少时触发。

```typescript
interface EventDataGroupIncrease extends EventDataBase<1> {
  event: "on_group_increase" | "on_group_decrease"
  /** User id who increased member */
  userId: string
  /** 
   * Operator id.
   * 
   * if it don't equal to `UserId` so member was invited by the group member when increasing
   * if it don't equal to `UserId` so member was kicked by the group manger when decreasing
   *  */
  operatorId: string
  /** Group id */
  groupId: string
}
```

参考：

```json
{
  "event": "on_group_increase",
  "time": 1669688800,
  "type": 1,
  "userId": "123456789",
  "operatorId": "987654321",
  "groupId": "987654321"
}
```

### on_group_admin

当群管理员变动时触发。

```typescript
interface EventDataGroupAdmin extends EventDataBase<1> {
  event: "on_group_admin"
  /** User id who be set or unset admin */
  userId: string
  /** Operation, be set or unset */
  operation: 'set' | 'unset'
  /** Group id */
  groupId: string
}
```

参考：

```json
{
  "event": "on_group_admin",
  "time": 1669688800,
  "type": 1,
  "userId": "123456789",
  "operation": "set",
  "groupId": "987654321"
}
```

### on_group_ban

当群成员禁言变动时触发。

```typescript
interface EventDataGroupBan extends EventDataBase<1> {
  event: "on_group_ban"
  /** User id who be banned */
  userId: string
  /** Operator id */
  operatorId: string
  /** Ban duration (seconds), if equal to 0, it means unban */
  duration: number
  /** Group id */
  groupId: string
}
```

参考：

```json
{
  "event": "on_group_ban",
  "time": 1669688800,
  "type": 1,
  "userId": "123456789",
  "operationId": "987654321",
  "groupId": "987654321",
  "duration": "3600"
}
```

### on_group_whole_ban

当群全体禁言变动时触发。

```typescript
interface EventDataGroupWholeBan extends EventDataBase<1> {
  event: "on_group_whole_ban"
  userId: never
  /** Operator id */
  operatorId: string
  /** Operation, set or unset whole ban */
  operation: 'set' | 'unset'
  /** Group id */
  groupId: string
}
```

参考：

```json
{
  "event": "on_group_whole_ban",
  "time": 1669688800,
  "type": 1,
  "operatorId": "987654321",
  "operation": "set",
  "groupId": "987654321"
}
```

## Action

Action 的请求数据由后端通过 `ws.onmessage` 事件向前端下发，前端接收后解析数据并通过内部自己的沙盒方法执行相应操作，部分 Action 带有响应数据，由前端通过 `ws.send()` 方法向后端发送响应响应数据。

1. 在后端发来请求后，前端应立即处理并判断是否需要发送响应数据，如若需要则应即刻发送
2. 在部分查询数据的动作中，若前端无法查询到响应数据，则响应数据的每个字段替换为该数据字段类型的空值，而不是 `null`，如字符串类型替换为 `""`，数字类型替换为 `0`，数组类型替换为 `[]`
3. 所有的动作中，如如未特别注明，都应从当前沙盒中的 Bot 的角度触发，即获取的数据与进行的操作都是当前 Bot 的角度，Bot 无法向未加入的群聊和添加的好友发送消息，也无法获取未加入的群聊的详细成员信息

基础数据结构：

```typescript
interface ActionDataBase {
  action: string // 操作类型
}
```

### sendPrivateMsg

发送私聊消息。

```typescript
interface ActionSendPrivateMsg extends ActionDataBase {
  action: "send_private_msg"
  message: string // 消息内容
  userId: string // 好友 ID
}
```

参考：

```json
{
  "action": "send_private_msg",
  "message": "Hello, World!",
  "userId": "123456789"
}
```

响应数据：

```typescript
interface SendMessageResponse {
  response: 'send_message_response'
  /** Message id */
  messageId: string
  /** Send time (milliseconds timestamp) */
  time: number
}
```

参考：

```json
{
  "response": "send_message_response",
  "messageId": "123456789",
  "time": 1669688800
}
```

### sendGroupMsg

发送群聊消息。

```typescript
interface ActionSendGroupMsg extends ActionDataBase {
  action: "send_group_msg"
  message: string // 消息内容
  groupId: string // 群组 ID
}
```

参考：

```json
{
  "action": "send_group_msg",
  "message": "Hello, World!",
  "groupId": "987654321"
}
```

响应数据：与 `sendPrivateMsg` 相同

### deleteMsg

撤回消息。

```typescript
interface ActionDeleteMsg extends ActionDataBase {
  action: "delete_msg"
  messageId: string // 消息 ID
}
```

参考：

```json
{
  "action": "delete_msg",
  "messageId": "123456789"
}
```

无响应数据

### getSelfInfo

获取机器人自身信息。

```typescript
interface ActionGetSelfInfo extends ActionDataBase {
  action: "get_self_info"
}
```

响应数据：

```typescript
export interface SelfInfoResponse {
  response: 'self_info_response'
  /** User id */
  userId: string
  /** User name or nickname */
  username: string
  /** The display name, or empty string if none */
  userDisplayname: string
}
```

参考：

```json
{
  "response": "self_info_response",
  "userId": "123456789",
  "username": "bot 1",
  "userDisplayname": ""
}
```

### getUserInfo

获取用户信息（可获取沙盒中所有用户信息）。

```typescript
interface ActionGetUserInfo extends ActionDataBase {
  action: "get_user_info"
  userId: string
}
```

响应数据：

```typescript
export interface UserInfoResponse extends SelfInfoResponse {
  response: 'user_info_response'
  /** The remark name set set by current bot account, or empty string if none */
  userRemark: string
}
```

参考：

```json
{
  "response": "user_info_response",
  "userId": "123456789",
  "username": "user 1",
  "userDisplayname": "",
  "userRemark": ""
}
```

### getFriendList

获取 Bot 的好友列表。

```typescript
interface ActionGetFriendList extends ActionDataBase {
  action: "get_friend_list"
}
```

响应数据：`UserInfoResponse[]`

### getGroupInfo

获取群组信息（可获取沙盒中所有群组信息）。

```typescript
interface ActionGetGroupInfo extends ActionDataBase {
  action: "get_group_info"
  groupId: string
}
```

响应数据：

```typescript
export interface GroupInfoResponse {
  response: 'group_info_response'
  /** Group id */
  groupId: string
  /** Group name */
  groupName: string
}
```

参考：

```json
{
  "response": "group_info_response",
  "groupId": "987654321",
  "groupName": "A group"
}
```

### getGroupList

获取 Bot 的群组列表。

```typescript
interface ActionGetGroupList extends ActionDataBase {
  action: "get_group_list"
}
```

响应数据：`GroupInfoResponse[]`

### getGroupMemberInfo

获取群成员信息。

```typescript
interface ActionGetGroupMemberInfo extends ActionDataBase {
  action: "get_group_member_info"
  groupId: string // 群组 ID
  userId: string // 用户 ID
}
```

响应数据：

```typescript
export interface GroupMemberInfoResponse {
  response: 'group_member_info_response'
  /** User id */
  userId: string
  /** User name or nickname */
  username: string
  /** The display name, or empty string if none */
  userDisplayname: string
}
```

参考：

```json

{
  "response": "group_member_info_response",
  "userId": "123456789",
  "username": "user 1",
  "userDisplayname": ""
}
```

### getGroupMemberList

获取群成员列表。

```typescript
interface ActionGetGroupMemberList extends ActionDataBase {
  action: "get_group_member_list"
  groupId: string // 群组 ID
}
```

响应数据：`GroupMemberInfoResponse[]`

### setGroupName

设置群名。

```typescript
interface ActionSetGroupName extends ActionDataBase {
  action: "set_group_name"
  groupId: string // 群组 ID
  groupName: string // 群名
}
```

参考：

```json
{
  "action": "set_group_name",
  "groupId": "987654321",
  "groupName": "Hello, World!"
}
```

无响应数据

### leaveGroup

退出群聊，若当前登录用户为群主则表明解散群聊。

```typescript
interface ActionSetGroupLeave extends ActionDataBase {
  action: "leave_group"
  groupId: string // 群组 ID
}
```

参考：

```json
{
  "action": "leave_group",
  "groupId": "987654321",
}
```

无响应数据

### setGroupAdmin

设置管理员。

```typescript
interface ActionSetGroupAdmin extends ActionDataBase {
  action: "set_group_admin"
  groupId: string // 群组 ID
  userId: string // 用户 ID
  enable: boolean // 是否启用
}
```

参考：

```json
{
  "action": "set_group_admin",
  "groupId": "987654321",
  "userId": "123456789",
  "enable": true
}
```

无响应数据

### setGroupCard

设置群名片。

```typescript
interface ActionSetGroupCard extends ActionDataBase {
  action: "set_group_card"
  groupId: string // 群组 ID
  userId: string // 用户 ID
  card: string // 群名片
}
```

参考：

```json
{
  "action": "set_group_card",
  "groupId": "987654321",
  "userId": "123456789",
  "card": "Hello, World!"
}
```

无响应数据

### setGroupBan

禁言。

```typescript
interface ActionSetGroupBan extends ActionDataBase {
  action: "set_group_ban"
  groupId: string // 群组 ID
  userId?: string // 用户 ID，
  time?: number // 禁言时间，单位秒
}
```

参考：

```json
{
  "action": "set_group_ban",
  "groupId": "987654321",
  "userId": "123456789",
  "time": 3600
}
```

无响应数据

### setGroupWholeBan

群全体禁言。

```typescript
interface ActionSetGroupWholeBan extends ActionDataBase {
  action: "set_group_whole_ban"
  groupId: string // 群组 ID
  enable: boolean // 是否启用
}
```

参考：

```json
{
  "action": "set_group_whole_ban",
  "groupId": "987654321",
  "enable": true
}
```

无响应数据

### setGroupKick

踢出群聊。

```typescript
interface ActionSetGroupKick extends ActionDataBase {
  action: "set_group_kick"
  groupId: string // 群组 ID
  userId: string // 用户 ID
}
```

参考：

```json
{
  "action": "set_group_kick",
  "groupId": "987654321",
  "userId": "123456789"
}
```

无响应数据

### 通知向信息

由后端主动下发，前端无需进行具体处理也无需响应，仅做通知用。

### onDataError

当前端向后端发送的事件数据格式错误时触发。

```typescript
interface ActionOnDataError {
  action: "on_data_error",
  error: string // 错误信息（来自 `Tsukiko` 的数据解析器错误信息）
}
```

## Elements

即消息元素，用于显示多种非文本消息内容，其按照以下约定格式内联在消息字符串中。前端在接收到 `send_private_msg` 或 `send_group_msg` Action 时，应对 `message` 进行预处理，将消息元素的约定格式转换成可直接用于渲染在页面上的 html 标签，如一个消息 `[image,https://example.com/image.png]` -> `<img src="https://example.com/image.png" />`，当然也可以给 `img` 标签加一些 style 样式用于适配页面布局等，正是因为考虑到这点，后端并不给出可直接用于渲染的消息字符串。而在预处理完毕之后才将消息保存。

### text

- `<text>`

示例：`这是一串普通的文本`

### image

- `[image,<url>]`

示例：`[image,https://example.com/image.png]`

### video

- `[video,<url>]`

示例：`[video,https://example.com/video.mp4]`

### mention

- `[mention,<userId>]`

示例：`[mention,123456789]`

期望渲染结果：`@username`，若当前聊天为私聊，则忽略该元素渲染，若为群聊，前端应尝试在当前群聊的成员列表中查询响应用户并将 `<userId>` 替换为该用户的名字，如若找不到，则直接渲染原内容（`@123456789`）。

### mentionAll

- `[mentionAll]`

期望渲染结果：`@全体成员` 或 `@所有人`，同样的，若当前聊天为私聊，则忽略该元素渲染。

### reply

- `[reply,<messageId>]`

示例：`[reply,123456789]`

期望渲染结果：按照类似于 QQ 回复的样式转成可直接渲染的 html。前端应尝试在当前聊天（私聊和群聊均可）内查找目标消息，若查不到则忽略该元素渲染。

### voice

- `[voice,<url>]`

示例：`[voice,https://example.com/voice.mp3]`

### audio

- `[audio,<url>]`

示例：`[audio,https://example.com/audio.mp3]`

虽然 `voice` 与 `audio` 都引用的音频文件，但前者为语音，后者为音频文件，应在渲染样式上有所不同。

### location

- `[location,<title>,<content>,<latitude>,<longitude>]`

示例：`[location,北京市,北京市东城区,39.915,116.404]`
