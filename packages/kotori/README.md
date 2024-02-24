<!-- markdownlint-disable -->

<div align="center">
<img src="https://kotori.js.org/favicon.svg" width="200px" height="200px" alt="logo"/>

# 小鳥 · KotoriBot

[入门教程](https://kotori.js.org/base/)
[开发指南](https://kotori.js.org/guide/)
[接口参考](https://kotori.js.org/api/)

[![Build](https://github.com/kotorijs/kotori/actions/workflows/build.yml/badge.svg)](https://github.com/kotorijs/kotori/actions/workflows/build.yml)
![GitHub last commit (by committer)](https://img.shields.io/github/last-commit/biyuehu/biyuehu)
![GitHub commit activity (branch)](https://img.shields.io/github/commit-activity/t/kotorijs/kotori/master)
![GitHub](https://img.shields.io/github/license/biyuehu/kotori-bot?color=deepgreen)
![npm](https://img.shields.io/npm/v/kotori-bot)
[![wakatime](https://wakatime.com/badge/user/018dc603-712a-4205-a226-d4c9ccd0d02b/project/018dc605-aa92-43d3-b2a7-ed9829c0212e.svg)](https://wakatime.com/badge/user/018dc603-712a-4205-a226-d4c9ccd0d02b/project/018dc605-aa92-43d3-b2a7-ed9829c0212e)

</div>

---

kotori 是一个**跨平台、解耦合、现代化**于一体的聊天机器人框架，运行于 Node.js 环境，使用 TypeScript 语言开发。

---

## 🚀 Summary

「Kotori」是一个罗马字，在日语中是「ことり」（小鳥）的意思，发音为 `/kotoliː/` 提交，该名字取自于 [Key 公式](http://key.visualarts.gr.jp/) 的游戏 [《Rewrite》](https://bgm.tv/subject/4022) 中主要女性角色之一：神户小鸟 (神戸（かんべ） 小鳥（ことり）)。借助 Kotori，可快速搭建一个多平台、功能强大的聊天机器人应用，通过安装不同模块为 Kotori 扩展功能、玩法和个性化配置等。同时，Kotori 为开发者提供了现成的 Cli 用于模块开发与 Kotori 二次开发。

### Advantage

- **跨平台**
  得益于模块化支持，通过编写各种模块实现不同的功能与聊天平台接入

- **解耦合**
  基于控制反转（IOC）与面向切面编程（AOP）思想，减少代码冗余与复杂度

- **现代化**
  使用现代化的 ECMAScript 语法规范与强大的 TypeScript 类型支持

### 🧊 Supports

#### Platform

- QQ（基于 Tencent 官方 API）
- QQ（基于 Onebot 标准的 [go-cqhttp](https://github.com/Mrs4s/go-cqhttp) 项目）
- CMD 命令行

即将支持：

- Telegram
- Kook/开黑啦
- MinecraftBedrock（基于 Websocket）
- WeChat/微信
- Discord

#### Data

- File
- Sqlite

---

## 📜 Reference

- [Kotori Docs](https://kotori.js.org/)
