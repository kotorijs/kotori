# @kotori-bot/kotori-plugin-core

Base on tencent api.

## Commands

- `/core` View instance statistics
- `/bot` View current bot info and running status
- `/bots` View all bots info and running status
- `/about` View about info
- `/help [...command]` View command help info
- `/menu` View Bot's menu

```bash
/core
> Global Language: en_US
Root Directory: \usr\kotori
Running Mode: dev
Number of Modules: 21
Number of Services: 3
Number of Bots: 1
Number of Middlewares: 1
Number of Commands: 27
Number of Regexps: 25

/bot
> ID: cmd-test
Language: en_US
Platform: cmd
Self ID: 720
Connect Time: 24/2/4 18:36:36
Messages Received: 16
Messages Sent: 15
Offline Times: 0
Last Message Time: 24/2/4 18:45:45

/bots
> Bot List:
----------
ID: cmd-test
Language: en_US
Platform: cmd
Status: online

/about
> Kotori Version: 1.2.0
License: GPL-3.0
NodeJS Version: v18.18.1

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
