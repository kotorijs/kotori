# @kotori-bot/kotori-plugin-adapter-onebot

Base on tencent api.

## Config

```typescript
interface QQConfig extends AdapterConfig {
  appid: string; // QQ bot's appid
  secret: string; // QQ bot's secret
  retry: number; // Retry connect time (default: 10 Seconds)
}
```

## Reference

- [Kotori Docs](https://kotori.js.org/)
- [QQ机器人文档](https://bot.q.qq.com/wiki/develop/api-v2/)
