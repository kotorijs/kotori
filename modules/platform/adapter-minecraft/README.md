# @kotori-bot/kotori-plugin-adapter-minecraft

Base on `mcwss` package for Minecraft Bedrock Edition, support `private` and `group` scope.

## Config

```typescript
export const config = Tsu.Object({
  nickname: Tsu.String().default('Romi').describe('Bot\'s name'),
  template: Tsu.Union(Tsu.Null(), Tsu.String()).default('<%nickname%> %msg%').describe('The template of bot sent message ')
})
```

## Supports

### Events

- on_message (`MessageScope.PRIVATE` and `MessageScope.GROUP`)

### Api

- sendPrivateMsg

### Elements

- text
- mention
- mentionAll

## TODO

### Todo Events

- on_group_increase
- on_group_decrease
- on_group_ban

### Todo Api

- getGroupMemberInfo
- getGroupMemberList
- setGroupAdmin
- setGroupBan
- setGroupKick

### Other

Adapter server [LeviLamina](https://github.com/LiteLDev/LeviLamina/) and Java Edition.

## Reference

- [Kotori Docs](https://kotori.js.org/)
- [McWss](https://github.com/biyuehu/mcwss)
