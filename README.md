[![Build Status](https://app.travis-ci.com/BIYUEHU/kotori-bot.svg?branch=master)](https://app.travis-ci.com/BIYUEHU/kotori-bot) ![GitHub commit activity (branch)](https://img.shields.io/github/commit-activity/t/BIYUEHU/kotori-bot/master) ![npm collaborators](https://img.shields.io/npm/collaborators/kotori-bot)  ![GitHub](https://img.shields.io/github/license/biyuehu/kotori-bot?color=deepgreen) ![npm](https://img.shields.io/npm/v/kotori-bot) ![GitHub Repo stars](https://img.shields.io/github/stars/biyuehu/kotori-bot?style=social)

**KotoriBot**是一个**go-cqhttp**的基于**NodeJS**+**TypeScript**的SDK和QQ机器人框架实现,相比于其它的go-cqhttp的NodeJS实现，Kotori-Bot的最大特点便是完全由纯**TypeScript**语言开发

**Kotori**是一个罗马字，在日语中是**ことり(小鳥)**的意思，该名字取自于[Key](https://mzh.moegirl.org.cn/Key)品牌[Galgame](https://mzh.moegirl.org.cn/Galgame)《[Rewrite](https://mzh.moegirl.org.cn/Rewrite(游戏))》及其衍生作品中的登场角色及主要女性角色之一的**神户小鸟**(神戸（かんべ） 小鳥（ことり）)。

> [开发文档](develop.md)

> 糊狸博客:[imlolicon.tk](https://imlolicon.tk)

## 关于go-cqhttp
**go-cqhttp**是基于 Mirai 以及 MiraiGo 的 OneBot Golang 原生实现

go-cqhttp官网:[https://docs.go-cqhttp.org/](https://docs.go-cqhttp.org/) gocq的安装与配置请参考网络

## 安装与使用
**Tips**:请先安装**NodeJS**环境和**NPM**或**Git**(可选)

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

下载完成后，在根目录运行以安装所有依赖库

```bash
npm install
```

### 直接运行
首先配置`config.yml`的相关参数，需与**Go-cqhttp**的配置一致
```yaml
connect: 
  # 连接模式 可选: http ws ws-reverse 推荐首选ws-reverse
  mode: ws-reverse
  # Go-cqhttp里设置的访问密钥 未设置则忽略(暂未支持)
  access-token: ''

  # Http正反向(暂未支持)
  http:
    url: "http://localhost" # 正向Http地址
    port: 8888 # 正向Http端口
    reverse-port: 8080 # 反向Http端口
    retry-time: 10 # 同上

  # WebSocket正向
  ws:
    url: "ws://localhost" # WS地址
    port: 8888 # WS端口
    retry-time: 10 # 连接断开或失败时尝试重连间隔时间 单位:秒

  # WebSocket反向(相对于Gocqhttp)
  ws-reverse:
    port: 8080 # WS反向端口

# 暂未实现
bot:
  # 机器人主人QQ号(拥有调试权限)
  master: 123
  # 指令列表
  command-list:
    reload: /reload # 热重载所有插件
```
运行
```bash
npm run start
```

或

```bash
ts-node ./src/app.ts
```


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
> 该方式下运行不会读取项目下的配置文件，需在实例化时传入配置参数，详细说明参考

## 插件下载与安装

将插件根文件夹或单文件放置在`plugins/`，Kotori会自动加载该目录下的所有相关文件

**KotoriBot**插件收集:[https://github.com/BIYUEHU/kotori-bot/tree/plugins](https://github.com/BIYUEHU/kotori-bot/tree/plugins)

该仓库分支专用于收集插件，将不定期更新，你可以直接通过**Pull Request**的方式将你的插件加入(或更新时)到仓库并更新该分支下`README.md`中的插件列表信息，亦或直接提供你发现的KotoriBot插件
