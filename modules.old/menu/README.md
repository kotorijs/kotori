# @kotori-bot/kotori-plugin-menu

## Commands

- `/menu` View Bot's menu

## Config

```typescript
interface Config extends ModuleConfig {
  alias?: string; // alias of /menu
  keywords?: string[]; // keyowrds of /menu
  content: string; // content of menu
}
```

## Reference

- [Kotori Docs](https://kotori.js.org/)
