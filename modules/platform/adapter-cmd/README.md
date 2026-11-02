# @kotori-bot/kotori-plugin-adapter-cmd

Base on console i/o, a method for quickly testing modules, only support `MessageScope.PRIVATE`.

## Config

```typescript
export const config = Tsu.Object({
  nickname: Tsu.String().default('Kotarou').describe('User\'s nickname'),
  'self-nickname': Tsu.String().default('KotoriO').describe('Bot\'s nickname'),
  'self-id': Tsu.String().default('720').describe('Bot\'s id'),
})
```

## Supports

### Events

- on_message (only `MessageScope.PRIVATE`)

### Api

- sendPrivateMsg

### Elements

- text
- mention
- mentionAll

## Reference

- [Kotori Docs](https://kotori.js.org/)
