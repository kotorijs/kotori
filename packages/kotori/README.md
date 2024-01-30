<div align="center">
<img src="https://kotori.js.org/favicon.ico" width="200px" height="200px" alt="logo"/>

# 小鳥 · KotoriBot

[使用指南](https://kotori.js.org/guide/)
[开发指南](https://kotori.js.org/develop/)  
[接口文档](https://kotori.js.org/api/)

[![Build](https://github.com/kotorijs/kotori/actions/workflows/build.yml/badge.svg)](https://github.com/kotorijs/kotori/actions/workflows/build.yml) ![GitHub last commit (by committer)](https://img.shields.io/github/last-commit/biyuehu/biyuehu) ![GitHub commit activity (branch)](https://img.shields.io/github/commit-activity/t/kotorijs/kotori/master) ![GitHub contributors](https://img.shields.io/github/contributors/biyuehu/kotori-bot) ![GitHub](https://img.shields.io/github/license/biyuehu/kotori-bot?color=deepgreen) ![npm](https://img.shields.io/npm/v/kotori-bot) ![GitHub Repo stars](https://img.shields.io/github/stars/biyuehu/kotori-bot?style=social)

</div>

---

kotori 是一个**跨平台、解耦合、现代化**于一体的 ChatBot 聊天机器人 框架，运行于 NodeJS 环境并使用 TypeScript 语言开发。

---

## Summary

**Kotori**是一个罗马字，在日语中是**ことり(小鳥)**的意思，该名字取自于[Key](http://key.visualarts.gr.jp/)公式游戏[《Rewrite》](https://bgm.tv/subject/4022)及其衍生作品中的主要女性角色之一的**[神户小鸟](https://bgm.tv/character/12063)**(神戸（かんべ） 小鳥（ことり）)。

### Advantages

- **跨平台**
  得益于模块化支持，通过编写各种模块实现不同的功能与聊天平台接入

- **解耦合**
  对底层事件封装实现核心功能，减少代码冗余与复杂度，提升开发效率

- **现代化**
  Kotori 使用现代化的 ECMAScript 语法规范与强大的 TypeScript 类型检查

## Reference

- [变更日志](CHANGELOG.md)

<!--
## kotori支持的连接模式

-   [x] 正向 WebSocket
-   [x] 反向 WebSocket

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
-->
