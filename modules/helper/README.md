# @kotori-bot/kotori-plugin-helper

## Commands

- `/help [...command]` View command help info
- `/menu` View Bot's menu

```bash
> Found the following related commands:
/core - View instance statistics
/bot - View current bot info and running status
/bots - View all bots info and running status
/about - View about info
/help [...command] - View command help info
```

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
