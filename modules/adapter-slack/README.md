# @kotori-bot/adapter-slack

Supports for slack. Create own bot: [Getting started](https://slack.dev/bolt-js/getting-started).

## Config

```typescript
export const config = Tsu.Object({
  token: Tsu.String().describe("Bot's token"),
  appToken: Tsu.String().describe('Application token (Use for socket connection)'),
  signingSecret: Tsu.String().describe('Signing secret')
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
- video

## TODO

Support more standard api...

## Reference

- [Kotori Docs](https://kotori.js.org/)
- [slack api](https://api.slack.com/docs)
