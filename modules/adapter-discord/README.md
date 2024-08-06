# @kotori-bot/adapter-discord

Supports for discord. Create own bot: [Discord Developer Portal](https://discord.com/developers/applications).

## Config

```typescript
export const config = Tsu.Object({
  token: Tsu.String().describe("Bot's token")
})
```

## Supports

### Events

- on_message (only `MessageScope.CHANNEL`)
- on_message_delete (only `MessageScope.CHANNEL`)

### Api

- sendChannelMsg

### Elements

- text

## TODO

Support more standard api...

## Reference

- [Kotori Docs](https://kotori.js.org/)
- [discord.js](https://discord.js.org/)
