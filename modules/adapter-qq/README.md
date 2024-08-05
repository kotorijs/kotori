# @kotori-bot/kotori-plugin-adapter-onebot

Base on tencent api.

## Config

```typescript
export const config = Tsu.Object({
  appid: Tsu.String().describe('Appid, get from https://q.qq.com/qqbot/'),
  secret: Tsu.String().describe("Bot's secret "),
  retry: Tsu.Number().positive().default(10).describe('try reconnect times when disconnected (seconds)')
})
```

## Reference

- [Kotori Docs](https://kotori.js.org/)
- [QQ机器人文档](https://bot.q.qq.com/wiki/develop/api-v2/)
