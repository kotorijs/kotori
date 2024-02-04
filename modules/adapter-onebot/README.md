# @kotori-bot/kotori-plugin-adapter-onebot

Base on [go-cqhttp](https://github.com/Mrs4s/go-cqhttp).

## Config

```typescript
interface OnebotConfig extends AdapterConfig {
  port: number; // Open or connect port (1 ~ 65525)
  address: string; // Open or connect address (ws://...)
  retry: number; // Retry connect time On websocket mode (default: 10 Seconds)
  mode: 'ws' | 'ws-reverse'; // Adapter mode: websocket or websocket reverse
}
```

## Reference

- [Kotori Docs](https://kotori.js.org/)
- [go-cqhttp 帮助中心](https://docs.go-cqhttp.org/)
