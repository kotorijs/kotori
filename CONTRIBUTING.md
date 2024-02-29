# 贡献指北

Kotori 贡献目前主要分为三种：

- Kotori 文档完善
- Webui 网页控制台
- Kotori 模块开发

基本要求：

- 基本会使用 GitHub 与 git 工具

## Kotori 文档完善

此处「文档」特指 [Kotori 开发文档](https://Kotori.js.org/guide)。文档为整个 Kotori 生态的重中之重，目前急需完善、准确、易懂的文档供给开发者参考。

### 要求

- 掌握 Markdown 语法
- 拥有一定的（JavaScript）代码阅读理解能力
- 拥有一定的语言表达能力

### 详情

文档是开发的基石，对于编写文档则需要从源码中参考、提取出有效信息、写成文字表达。源码参考请前往 Kotori 仓库（即本仓库），以下是对 Kotori 源码的简单说明：

- KotoriBot
  - Modules 包含了一系列 Kotori 模块
  - Packages
    - logger 日志打印工具库
    - i18n 国际化工具库
    - tools 工具库
    - loader Kotori 加载器
    - core Kotori 核心
    - Kotori Kotori 本体（含 `loader` 与 `core`）
   
对于文档编写主要参考 `packages/core/src/` 下的源码，因为 Kotori 大部分功能均源于此，当然对于某些功能的具体实现也可以参考 `modules/` 下的相应模块。以下是当前需要完善的文档篇目与主要涉及源码文件路径参考：

- 中间件 `base/message.ts`
- 正则匹配 `base/message.ts`
- 插件范式 `base/modules.ts`
- 上下文 `context/context.ts`
- 实现元素类 `components/elements.ts`
- 实现接口类 `components/api.ts`
- 实现适配器类 `components/adapter.ts`
- 生命周期 
- 服务依赖 `context/context.ts`
- 国际化 参考包 `packages/i18n`
- 日志打印 参考包 `packages/logger`
- 工具类 参考包 `packages/tools`
- 配置检测 参考包 [tsukiko](https://github.com/biyuehu/tsukiko)

### 步骤

- fork [Kotori Docs](https://github.com/kotorijs/docs) 仓库到你账户名下，并使用 git 工具克隆到本地
- 开发文档文件位于 `src/guide/` 下
- 更改完成后使用 git 工具推送到你的远程仓库
- 在 GitHub 上提交你的 pull request
- 等待通过即可完成本次贡献

### 参考

为保证文档的风格统一请遵循以下规范：

- [Markdown 风格指南](https://stdrc.cc/style-guides/markdown)
- [中文写作风格指南](https://stdrc.cc/style-guides/chinese)

## Webui 网页控制台

Webui 是 Kotori 的网页控制台，分为前后端两部分，此处特指前端部分，你可对其进行美化与扩展功能、页面。

### 要求

- 有一定的前端开发基础
- 基本掌握 Vue 框架的使用，因为 Webui 的前端部分是一个 Vue 项目

### 步骤

与上文类似。

> [kotorijs/webui](https://github.com/kotorijs/webui)

## 模块开发

模块对于 Kotori 生态也尤为重要，目前由于文档不完善，模块开发请参考本仓库 `modules/` 下的一系列模块源码。

### 要求

- 拥有一定的 JavaScript 基础（如果有 TypeScript 基础则更好）
- 拥有一定的 Node.js 基础（非必要，有则更好）

### 步骤

模块为你自己的开发成果，因此你不需要 fork 与提交 pull request 等操作。如果可以，当你的模块开发完毕时，请发布到 npm 与 GitHub。
