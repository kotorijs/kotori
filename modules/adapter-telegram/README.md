# @kotori-bot/adapter-telegram

Supports for telegram. Create own bot: [@BotFather](https://t.me/BotFather). And if you are in China, you can set proxy to connect telegram api.

## Config

```typescript
export const config = Tsu.Object({
  token: Tsu.String().describe("Bot's token"),
  proxy: Tsu.String().optional().describe('Proxy address (if you are in China)')
})
```

## Supports

### Events

- on_message (fully supported)

### Api

- sendPrivateMsg
- sendGroupMsg
- sendChannelMsg

### Elements

- text
- image
- voice
- audio
- video
- location

## TODO

Support more standard api...

## Reference

- [Kotori Docs](https://kotori.js.org/)
- [Telegram APIs](https://core.telegram.org/api)
