[![Build Status](https://app.travis-ci.com/BIYUEHU/kotori-bot.svg?branch=master)](https://app.travis-ci.com/BIYUEHU/kotori-bot) ![GitHub commit activity (branch)](https://img.shields.io/github/commit-activity/t/BIYUEHU/kotori-bot/master) ![npm collaborators](https://img.shields.io/npm/collaborators/kotori-bot)  ![GitHub](https://img.shields.io/github/license/biyuehu/kotori-bot?color=deepgreen) ![npm](https://img.shields.io/npm/v/kotori-bot) ![GitHub Repo stars](https://img.shields.io/github/stars/biyuehu/kotori-bot?style=social)

**KotoriBot**是一个**go-cqhttp**的基于**NodeJS**+**TypeScript**的SDK和QQ机器人框架实现,相比于其它的go-cqhttp的NodeJS实现，Kotori-Bot的最大特点便是完全由纯**TypeScript**语言开发

**Kotori**是一个罗马字，在日语中是**ことり(小鳥)**的意思，该名字取自于[Key](https://mzh.moegirl.org.cn/Key)品牌[Galgame](https://mzh.moegirl.org.cn/Galgame)《[Rewrite](https://mzh.moegirl.org.cn/Rewrite(游戏))》及其衍生作品中的登场角色及主要女性角色之一的**神户小鸟**(神戸（かんべ） 小鳥（ことり）)。

## 安装与使用
- **NPM**安装
  ```bash
  npm install kotori-bot
  ```

- **Git**安装
  ```bash
  git clone https://github.com/BIYUEHU/kotori-bot.git
  ```
  
- 手动下载安装
  [点击下载源码](https://github.com/BIYUEHU/kotori-bot/archive/refs/heads/master.zip)

### 直接运行

### 从源码里构建
如果你想将KotoriBot作为一个NPM包或者说node项目库来导入到你自己的项目使用搭建机器人的话，由于TS语言本身的原因，无法直接导入纯TypeScript项目，需要先构建一遍TS源码
```bash
npm run build
```
构建完成后的文件将生成在`dist/`文件下，但你无需顾忌这么多，直接引入即可

- TypeScript(.ts)

  ```typescript
  import Kotori from "kotori-bot";
  
  const Bot = new Kotori({
      mode: 'WsReverse',
      port: 8080
  }, (Event: any, Api: any) => {
      /* ... */
  });
  Bot.create();
  ```
  
- JavaScript With CommonJS(.js .cjs)

  ```javascript
  const Kotori = require("kotori-bot");
  const Bot = new Kotori({
      mode: 'WsReverse',
      port: 8080
  }, (Event, Api) => {
      /* ... */
  });
  Bot.create();
  ```
  
- JavaScript With ESModule(.cjs)

  ```javascript
  import Kotori from "kotori-bot";
  //...
  ```

  




### 关于go-cqhttp
**go-cqhttp**是基于 Mirai 以及 MiraiGo 的 OneBot Golang 原生实现
go-cqhttp官网:[https://docs.go-cqhttp.org/](https://docs.go-cqhttp.org/)
