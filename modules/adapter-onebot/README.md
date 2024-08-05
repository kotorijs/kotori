# @kotori-bot/kotori-plugin-adapter-onebot

![OneBot 11](https://img.shields.io/badge/OneBot-11-black?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHAAAABwCAMAAADxPgR5AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAAxQTFRF////29vbr6+vAAAAk1hCcwAAAAR0Uk5T////AEAqqfQAAAKcSURBVHja7NrbctswDATQXfD//zlpO7FlmwAWIOnOtNaTM5JwDMa8E+PNFz7g3waJ24fviyDPgfhz8fHP39cBcBL9KoJbQUxjA2iYqHL3FAnvzhL4GtVNUcoSZe6eSHizBcK5LL7dBr2AUZlev1ARRHCljzRALIEog6H3U6bCIyqIZdAT0eBuJYaGiJaHSjmkYIZd+qSGWAQnIaz2OArVnX6vrItQvbhZJtVGB5qX9wKqCMkb9W7aexfCO/rwQRBzsDIsYx4AOz0nhAtWu7bqkEQBO0Pr+Ftjt5fFCUEbm0Sbgdu8WSgJ5NgH2iu46R/o1UcBXJsFusWF/QUaz3RwJMEgngfaGGdSxJkE/Yg4lOBryBiMwvAhZrVMUUvwqU7F05b5WLaUIN4M4hRocQQRnEedgsn7TZB3UCpRrIJwQfqvGwsg18EnI2uSVNC8t+0QmMXogvbPg/xk+Mnw/6kW/rraUlvqgmFreAA09xW5t0AFlHrQZ3CsgvZm0FbHNKyBmheBKIF2cCA8A600aHPmFtRB1XvMsJAiza7LpPog0UJwccKdzw8rdf8MyN2ePYF896LC5hTzdZqxb6VNXInaupARLDNBWgI8spq4T0Qb5H4vWfPmHo8OyB1ito+AysNNz0oglj1U955sjUN9d41LnrX2D/u7eRwxyOaOpfyevCWbTgDEoilsOnu7zsKhjRCsnD/QzhdkYLBLXjiK4f3UWmcx2M7PO21CKVTH84638NTplt6JIQH0ZwCNuiWAfvuLhdrcOYPVO9eW3A67l7hZtgaY9GZo9AFc6cryjoeFBIWeU+npnk/nLE0OxCHL1eQsc1IciehjpJv5mqCsjeopaH6r15/MrxNnVhu7tmcslay2gO2Z1QfcfX0JMACG41/u0RrI9QAAAABJRU5ErkJggg==)

Base on [OneBot 11 Standard](https://github.com/botuniverse/onebot-11), you can use the these programs that support OneBot 11's implement to connect with qq:

- For Linux: [NapCat](https://napneko.github.io/)
- For Windows: [LiteLoaderQQNT](https://liteloaderqqnt.github.io/) with [LLOneBot](https://llonebot.github.io/)
- No more available: [go-cqhttp](https://docs.go-cqhttp.org/)

## Config

```typescript
export const config = Tsu.Union(
  Tsu.Object({
    mode: Tsu.Literal('ws').describe('Connect mode: WebSocket'),
    port: Tsu.Number().port().describe('WebSocket server port'),
    address: Tsu.String()
      .regexp(/^ws(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/)
      .default('ws://127.0.0.1')
      .describe('WebSocket address'),
    retry: Tsu.Number().int().min(1).default(10).describe('try reconnect times when disconnected')
  }),
  Tsu.Object({
    mode: Tsu.Literal('ws-reverse').describe('Connect mode: WebSocket Reverse')
  })
)
```

## Supports

### Events

- on_message (exclude `MessageScope.CHANNEL`)
- on_message_delete (exclude `MessageScope.CHANNEL`)
- on_request (exclude `RequestScope.CHANNEL`)
- on_group_increase
- on_group_decrease
- on_group_admin
- on_group_ban
- custom: onebot_poke

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
- setGroupAvatar
- setGroupBan
- setGroupWholeBan
- setGroupNotice
- setGroupKick

### Elements

- text
- mention
- mentionAll
- image
- voice
- video
- reply

## Reference

- [Kotori Docs](https://kotori.js.org/)
- [go-cqhttp 帮助中心](https://docs.go-cqhttp.org/)
- [OneBot](https://onebot.dev/)
