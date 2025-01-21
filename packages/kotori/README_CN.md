<!-- markdownlint-disable -->

<div align="center">
<img src="https://kotori.js.org/favicon.svg" width="200px" height="200px" alt="logo"/>

# 小鳥 · KotoriBot

[Quick Start](https://kotori.js.org/basic/)
[Dev Guide](https://kotori.js.org/guide/)
[API Reference](https://kotori.js.org/api/)

[![Build](https://github.com/kotorijs/kotori/actions/workflows/build.yml/badge.svg)](https://github.com/kotorijs/kotori/actions/workflows/build.yml)
![GitHub last commit (by committer)](https://img.shields.io/github/last-commit/biyuehu/biyuehu)
![GitHub commit activity (branch)](https://img.shields.io/github/commit-activity/t/kotorijs/kotori/master)
[![License](https://img.shields.io/badge/license-BCU-fe0000)](https://github.com/iceagenb/ban-chinaman-using)
![npm](https://img.shields.io/npm/v/kotori-bot)
[![wakatime](https://wakatime.com/badge/user/018dc603-712a-4205-a226-d4c9ccd0d02b/project/018dc605-aa92-43d3-b2a7-ed9829c0212e.svg)](https://wakatime.com/badge/user/018dc603-712a-4205-a226-d4c9ccd0d02b/project/018dc605-aa92-43d3-b2a7-ed9829c0212e)
![OneBot 11](https://img.shields.io/badge/OneBot-11-black?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHAAAABwCAMAAADxPgR5AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAAxQTFRF////29vbr6+vAAAAk1hCcwAAAAR0Uk5T////AEAqqfQAAAKcSURBVHja7NrbctswDATQXfD//zlpO7FlmwAWIOnOtNaTM5JwDMa8E+PNFz7g3waJ24fviyDPgfhz8fHP39cBcBL9KoJbQUxjA2iYqHL3FAnvzhL4GtVNUcoSZe6eSHizBcK5LL7dBr2AUZlev1ARRHCljzRALIEog6H3U6bCIyqIZdAT0eBuJYaGiJaHSjmkYIZd+qSGWAQnIaz2OArVnX6vrItQvbhZJtVGB5qX9wKqCMkb9W7aexfCO/rwQRBzsDIsYx4AOz0nhAtWu7bqkEQBO0Pr+Ftjt5fFCUEbm0Sbgdu8WSgJ5NgH2iu46R/o1UcBXJsFusWF/QUaz3RwJMEgngfaGGdSxJkE/Yg4lOBryBiMwvAhZrVMUUvwqU7F05b5WLaUIN4M4hRocQQRnEedgsn7TZB3UCpRrIJwQfqvGwsg18EnI2uSVNC8t+0QmMXogvbPg/xk+Mnw/6kW/rraUlvqgmFreAA09xW5t0AFlHrQZ3CsgvZm0FbHNKyBmheBKIF2cCA8A600aHPmFtRB1XvMsJAiza7LpPog0UJwccKdzw8rdf8MyN2ePYF896LC5hTzdZqxb6VNXInaupARLDNBWgI8spq4T0Qb5H4vWfPmHo8OyB1ito+AysNNz0oglj1U955sjUN9d41LnrX2D/u7eRwxyOaOpfyevCWbTgDEoilsOnu7zsKhjRCsnD/QzhdkYLBLXjiK4f3UWmcx2M7PO21CKVTH84638NTplt6JIQH0ZwCNuiWAfvuLhdrcOYPVO9eW3A67l7hZtgaY9GZo9AFc6cryjoeFBIWeU+npnk/nLE0OxCHL1eQsc1IciehjpJv5mqCsjeopaH6r15/MrxNnVhu7tmcslay2gO2Z1QfcfX0JMACG41/u0RrI9QAAAABJRU5ErkJggg==)

</div>

---

「Kotori」是一个罗马字，在日语中是「ことり」（小鳥）的意思，发音为 `/kotolɪ/` <Voice />，该名字取自于 [Key 公式](http://key.visualarts.gr.jp/) 的游戏 [《Rewrite》](https://bgm.tv/subject/4022) 中主要女性角色之一：[神户小鸟](https://bgm.tv/character/12063) (神戸（かんべ） 小鳥（ことり）)。
借助 Kotori，可快速搭建一个多平台、功能强大的聊天机器人应用，通过安装不同模块为 Kotori 扩展功能、玩法和个性化配置等。同时，Kotori 为开发者提供了现成的 Cli 用于模块开发与 Kotori 二次开发。

### Advantage

- **跨平台**
  得益于模块化支持，通过编写各种模块实现不同的功能与聊天平台接入

- **解耦合**
  基于控制反转（IOC）与面向切面编程（AOP）思想，减少代码冗余与复杂度

- **现代化**
  使用现代化的 ECMAScript 语法规范与强大的 TypeScript 类型支持

### 🧊 Supports

#### Platform

- QQ（基于腾讯官方接口）
- QQ（基于 [OneBot11 标准](https://onebot.dev/)，适用于 [NapCat](https://github.com/NapNeko/NapCatQQ)、[go-cqhttp](https://github.com/Mrs4s/go-cqhttp) 等项目）
- CMD 命令行
- Slack
- Telegram
- Email
- Discord
- MinecraftBedrock (基于 WebSocket)

即将支持：

- Kook/开黑啦
- WeChat/微信
- Line
- What's App
- DingTalk

#### Data

- LevelDb

Kotori 使用极为轻量的 LevelDb 作为数据存储。

## 📖 Documentation

- [Kotori Docs](https://kotori.js.org/)
