# @kotori-bot/i18n

这是一个轻量级的国际化（i18n）工具库，可以方便地实现 JavaScript/TypeScript 项目的本地化支持。

## 🎯 What

它通过结合 ECMAScript 国际化API，可以快速为项目添加多语言翻译能力，使同一套代码支持多种语言，而不需要重新部署。开发者只需准备翻译文件，就可以轻松适配不同地区的用户。

## 🚀 Advantage

- 零外部依赖，轻量小巧，性能高效，
- 无运行环境要求，支持所有基于现代 ECMAScript 标准的运行时
- 支持日期、数字等常用格式的本地化转换
- 基于 TypeScript 开发，高雅的类型支持

## 📚 Usage

- 通过 `use()` 方法加载翻译文件
- 使用 `locale()` 获取已翻译的文案字符串
- 调用格式化方法实现日期、数字显示本地化
- 设置 `lang` 属性切换语言,扩展新实例添加语言

```typescript
import I18n from '@kotori-bot/i18n';

const i18n = new I18n();

i18n.use(translations, 'en');

i18n.locale('hello'); // 获取翻译文案

i18n.date(Date.now()); // 本地化格式化日期
i18n.number(10000); // 转换数字格式

i18n.setLang('zh'); // 切换语言
```

`translations` 可通过导入外部 JavaScript/TypeScript 文件获取，在 Node.js 环境中，将该参数替换成目录名，可自动读取指定目录下所有符合文件名与后缀名要求的数据（json/yaml 或者更多...）文件，并自动加载。

## 📕 Reference

- [Kotori Docs](https://kotori.js.org/)
