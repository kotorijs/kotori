# WebSocket Data Interaction

## Events

Events 由前端通过 `ws.send()` 方法向后端上报，每个 Events 对应前端内部自己的沙盒事件。

所有事件的接收者均为沙盒中当前登录用户，不应收到其它用户的事件，如：沙盒中有 `U1`、`U2`、`U3` 三个用户与 `G1`、`G2` 两个群组，`U1` 加入了 `G1` 群组，`U2` 加入了 `G2` 群组，`U3` 两个群组均加入，当前登录用户为 `U1`。此时 `U3` 向 `G2` 群组发送消息，`U1` 不在 `G2` 群组因此无法收到事件，当 `U3` 向 `G1` 群组发送消息时，`U1` 收到事件，前端向后端上报事件数据。

---

基础数据结构：

```typescript
interface EventDataBase {
  event: string // 事件名
  time: number // 事件触发时间（时间戳）
}
```

消息发送者数据结构：

```typescript
interface Sender {
  nickname: string // 用户名
  sex: "male" | "female" | "unknown" // 性别
  age: number // 年龄
}
```

当消息类型为群聊时会有额外数据：

```typescript
interface Sender {
  /* ... */
  role: "member" | "admin" | "owner" // 用户在群内角色，成员、管理员、群主
  level: string // 用户在群等级，默认为 "0"
  title: string // 用户在群内名称（如若用户未设置群内名称则与 `nickname` 一致）
}
```

### on_message

当收到消息时触发。

```typescript
interface EventDataMsg extends EventDataBase {
  event: "on_message"
  type: 0 | 1 // 消息类型，0 私聊，1 群聊
  messageId: number // 消息 ID
  message: string // 消息内容
  userId: number // 发送者 ID
  sender: Sender // 发送者
  groupId?: number // 群组 ID，仅当消息类型为群聊时存在
}
```

参考：

```json
{
  "event": "on_message",
  "time": 1669688800,
  "type": 0,
  "messageId": 123456789,
  "message": "Hello, World!",
  "userId": 123456789,
  "sender": {
    "nickname": "User1",
    "sex": "male",
    "age": 18
  }
}
```

### on_recall

当撤回消息时触发。

```typescript
interface EventDataRecall extends EventDataBase {
  event: "on_recall"
  type: 0 | 1
  messageId: number
  userId: number // 撤回者 ID
  groupId?: number // 同上
  operatorId?: number // 操作者 ID，若与 `userId` 不一致则表明为管理员撤回
}
```

参考：

```json
{
  "event": "on_recall",
  "time": 1669688800,
  "type": 1,
  "messageId": 123456789,
  "userId": 123456789,
  "groupId": 987654321,
  "operatorId": 987654321
}
```

### on_request

当收到好友申请或加群申请时触发。

```typescript
interface EventDataPrivateRequest extends EventDataBase {
  event: "on_request"
  type: 0 | 1 // 请求类型，0 好友申请，1 加群申请
  userId: number // 请求者 ID
  groupId?: number // 群组 ID，仅当请求类型为加群申请时存在
  operatorId: number // 操作者 ID，仅当请求类型为加群时存在，若与 `userId` 不一致则表明为群成员邀请
}
```

参考：

```json
{
  "event": "on_request",
  "time": 1669688800,
  "type": 1,
  "userId": 123456789,
  "groupId": 987654321,
  "operatorId": 987654321
}
```

### on_private_add

当好友列表增加时触发。

```typescript
interface EventDataPrivateAdd extends EventDataBase {
  event: "on_private_add"
  userId: number // 好友 ID
}
```

参考：

```json
{
  "event": "on_private_add",
  "time": 1669688800,
  "userId": 123456789
}
```

### on_group_increase

当群成员增加时触发。

```typescript
interface EventDataGroupIncrease extends EventDataBase {
  event: "on_group_increase"
  userId: number // 加入者 ID
  groupId: number // 群组 ID
  operatorId: EventDataTargetId // 操作者 ID，若与 `userId` 不一致则表明为群成员邀请
}
```

参考：

```json
{
  "event": "on_group_increase",
  "time": 1669688800,
  "userId": 123456789,
  "groupId": 987654321,
  "operatorId": 987654321
}
```

### on_group_decrease

当群成员减少时触发。

```typescript
interface EventDataGroupDecrease extends EventDataBase {
  event: "on_group_decrease"
  userId: number // 离开者 ID
  groupId: number // 群组 ID
  operatorId: EventDataTargetId // 操作者 ID，若于 `userId` 不一致则表明为管理员移除
}
```

参考：

```json
{
  "event": "on_group_decrease",
  "time": 1669688800,
  "userId": 123456789,
  "groupId": 987654321,
  "operatorId": 987654321
}
```

### on_group_admin

当群管理员变动时触发。

```typescript
interface EventDataGroupAdmin extends EventDataBase {
  userId: EventDataTargetId // 变动者 ID
  operation: "set" | "unset" // 操作类型，设置或取消
  groupId: EventDataTargetId
}
```

参考：

```json
{
  "event": "on_group_admin",
  "time": 1669688800,
  "userId": 123456789,
  "operation": "set",
  "groupId": 987654321
}
```

### on_group_ban

当群禁言变动时触发。

```typescript
interface EventDataGroupBan extends EventDataBase {
  userId: EventDataTargetId | "all" // 变动者 ID，为 'all' 时表明为全体禁言
  operationId: number // 操作者 ID
  groupId: EventDataTargetId
  duration: number // 禁言时长，单位为秒，为 0 时表明为取消禁言
}
```

参考：

```json
{
  "event": "on_group_ban",
  "time": 1669688800,
  "userId": 123456789,
  "operationId": 987654321,
  "groupId": 987654321,
  "duration": 3600
}
```

## Action

Action 由后端通过 `ws.onmessage` 事件向前端下发，前端接收后解析数据并通过内部自己的沙盒方法执行相应操作。

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
  userId: number // 好友 ID
}
```

参考：

```json
{
  "action": "send_private_msg",
  "message": "Hello, World!",
  "userId": 123456789
}
```

### sendGroupMsg

发送群聊消息。

```typescript
interface ActionSendGroupMsg extends ActionDataBase {
  action: "send_group_msg"
  message: string // 消息内容
  groupId: number // 群组 ID
}
```

参考：

```json
{
  "action": "send_group_msg",
  "message": "Hello, World!",
  "groupId": 987654321
}
```

### deleteMsg

撤回消息。

```typescript
interface ActionDeleteMsg extends ActionDataBase {
  action: "delete_msg"
  messageId: number // 消息 ID
}
```

参考：

```json
{
  "action": "delete_msg",
  "messageId": 123456789
}
```

### setGroupName

设置群名。

```typescript
interface ActionSetGroupName extends ActionDataBase {
  action: "set_group_name"
  groupId: number // 群组 ID
  groupName: string // 群名
}
```

参考：

```json
{
  "action": "set_group_name",
  "groupId": 987654321,
  "groupName": "Hello, World!"
}
```

### setGroupAvatar

设置群头像。

```typescript
interface ActionSetGroupAvatar extends ActionDataBase {
  action: "set_group_avatar"
  groupId: number // 群组 ID
  image: string // 图片 URL
}
```

参考：

```json
{
  "action": "set_group_avatar",
  "groupId": 987654321,
  "image": "https://example.com/image.png"
}
```

### setGroupAdmin

设置管理员。

```typescript
interface ActionSetGroupAdmin extends ActionDataBase {
  action: "set_group_admin"
  groupId: number // 群组 ID
  userId: number // 用户 ID
  enable: boolean // 是否启用
}
```

参考：

```json
{
  "action": "set_group_admin",
  "groupId": 987654321,
  "userId": 123456789,
  "enable": true
}
```

### setGroupCard

设置群名片。

```typescript
interface ActionSetGroupCard extends ActionDataBase {
  action: "set_group_card"
  groupId: number // 群组 ID
  userId: number // 用户 ID
  card: string // 群名片
}
```

参考：

```json
{
  "action": "set_group_card",
  "groupId": 987654321,
  "userId": 123456789,
  "card": "Hello, World!"
}
```

### setGroupBan

禁言。

```typescript
interface ActionSetGroupBan extends ActionDataBase {
  action: "set_group_ban"
  groupId: number // 群组 ID
  userId?: number // 用户 ID，
  time?: number // 禁言时间，单位秒
}
```

参考：

```json
{
  "action": "set_group_ban",
  "groupId": 987654321,
  "userId": 123456789,
  "time": 3600
}
```

### sendGroupNotice

发送群公告。

```typescript

interface ActionSendGroupNotice extends ActionDataBase {
  action: "send_group_notice"
  groupId: number // 群组 ID
  content: string // 公告内容
  image?: string // 图片 URL，选填
}
```

参考：

```json
{
  "action": "send_group_notice",
  "groupId": 987654321,
  "content": "Hello, World!",
  "image": "https://example.com/image.png"
}
```

### setGroupKick

踢出群聊。

```typescript
interface ActionSetGroupKick extends ActionDataBase {
  action: "set_group_kick"
  groupId: number // 群组 ID
  userId: number // 用户 ID
}
```

参考：

```json
{
  "action": "set_group_kick",
  "groupId": 987654321,
  "userId": 123456789
}
```

### setGroupLeave

退出群聊，若当前登录用户为群主则表明解散群聊。

```typescript
interface ActionSetGroupLeave extends ActionDataBase {
  action: "set_group_leave"
  groupId: number // 群组 ID
}
```

参考：

```json
{
  "action": "set_group_leave",
  "groupId": 987654321,
}
```
