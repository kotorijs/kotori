# @kotori-bot/kotori-plugin-adapter-cmd

Base on console i/o,a method for quickly testing modules,only support `private` scope.

## Config

```typescript
interface CmdConfig extends Adapter {
  nickname?: string; // name of user(console)
  age?: string; // age of user
  sex?: 'male' | 'female'; // sex of user
  'self-nickname'?: string; // name of bot
  'self-id'?: string | number; // id of bot
}
```

## Reference

- [Kotori Docs](https://kotori.js.org/)
