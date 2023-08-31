<img  align="center" src="./favicon.ico" width="200px" height="200px"/>
<h1 align="center">小鳥 · KotoriBot</h1>

<p align="center">
<a href="./docs/CREATE.md">快速搭建</a>
<a href="./docs/GUIDE.md">使用指南</a>
<a href="./docs/DEVELOP.md">开发教程</a>
<a href="./docs/INTERFACE.md">接口文档</a>
</p>

[![Build Status](https://app.travis-ci.com/BIYUEHU/kotori-bot.svg?branch=master)](https://app.travis-ci.com/BIYUEHU/kotori-bot) ![GitHub commit activity (branch)](https://img.shields.io/github/commit-activity/t/BIYUEHU/kotori-bot/master) ![npm collaborators](https://img.shields.io/npm/collaborators/kotori-bot) ![GitHub](https://img.shields.io/github/license/biyuehu/kotori-bot?color=deepgreen) ![npm](https://img.shields.io/npm/v/kotori-bot) ![GitHub Repo stars](https://img.shields.io/github/stars/biyuehu/kotori-bot?style=social)

----

基于**NodeJS**+**TypeScript**的**go-cqhttp**的SDK和QQ机器人框架实现,相比于其它的go-cqhttp的NodeJS实现，Kotori-Bot的最大特点便是完全由纯**TypeScript**语言开发

**Kotori**是一个罗马字，在日语中是**ことり(小鳥)**的意思，该名字取自于[Key](http://key.visualarts.gr.jp/)公式游戏[《Rewrite》](https://bgm.tv/subject/4022)及其衍生作品中的主要女性角色之一的**[神户小鸟](https://bgm.tv/character/12063)**(神戸（かんべ） 小鳥（ことり）)。

> [Blog](https://imlolicon.tk)

------

## 概要
kotori是一个**快捷,轻便,跨平台**的BOT框架,去繁化简只为打造一个**重工具,轻娱乐**的工具性BOT

> [变更日志](CHANGELOG.md)

## kotori支持的连接模式
- [x] 正向 WebSocket
- [x] 反向 WebSocket

kotori目前现已支持go-cqhttp提供的67种`Api`,19种`Event`,18种`CQ Code`


## 关于插件

> [插件中心](docs/PLUGINS.md)

收集插件将不定期更新，你可以直接通过**Pull Request**的方式将你的插件加入(或更新时)到仓库并更新`docs/PLUGINS.md`中的插件列表信息

> 以下内容已不保证时效性

### 从源码里构建

如果你想将KotoriBot作为一个NPM包或者说node项目库来导入到你自己的项目使用搭建机器人的话，由于TS语言本身的原因，无法直接导入纯TypeScript项目，需要先构建一遍TS源码

```bash
npm run build
```

构建完成后的文件将生成在`dist/`文件下，但你无需顾忌这么多，直接引入即可

-   TypeScript(.ts)

    ```typescript
    import Kotori from 'kotori-bot';

    const Bot = new Kotori(
    	{
    		mode: 'WsReverse',
    		port: 8080,
    	},
    	(Event: any, Api: any) => {
    		/* ... */
    	},
    );
    Bot.create();
    ```

-   JavaScript With CommonJS(.js .cjs)

    ```javascript
    const Kotori = require('kotori-bot');
    const Bot = new Kotori(
    	{
    		mode: 'WsReverse',
    		port: 8080,
    	},
    	(Event, Api) => {
    		/* ... */
    	},
    );
    Bot.create();
    ```

-   JavaScript With ESModule(.mjs)

    ```javascript
    import Kotori from 'kotori-bot';
    //...
    ```

    > 该方式下运行不会读取项目下的配置文件，需在实例化时传入配置参数，详细说明参考
