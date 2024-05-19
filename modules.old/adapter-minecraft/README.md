# @kotori-bot/kotori-plugin-adapter-minecraft

Base on `mcwss` package for Minecraft Bedrock Edition,support `private` and `group` scope.

## Config

```typescript
interface CmdConfig extends Adapter {
  'command-prefix': string; // no "/"
  port: number; // server port,
  address: string; // server address,
  nickname?: string; // name of bot
  template: null | string; // bot message formation, example: <§b§l%nickname%§f> §a%msg%§f
}
```

## Reference

- [Kotori Docs](https://kotori.js.org/)
