# @kotori-bot/logger

这是一个轻量级的日志记录器，主要用于 Node.js 环境中，可以灵活记录应用运行时的日志。

## 🎯 What

在Node.js后端服务器中,日志记录对于了解应用运行状态、追踪故障原因都至关重要。该模块提供适合Node环境的日志解决方案。

## 🚀 Advantage

- 支持按级别过滤日志输出，支持自定义过滤器函数
- 可扩展自定义日志处理逻辑
- 模板化格式化日志，便于阅读解析
- 支持 label 标识来源
- 多传输通道输出，支持任意的可读流
- 灵活的颜色与样式支持（ConsoleTransport）

## 🌰 Example

```typescript
// ./src/example/example1.ts

import Logger, { ConsoleTransport, LoggerLevel } from '@kotori-bot/logger';

const logger = new Logger({
  level: LoggerLevel.TRACE,
  label: [],
  transports: new ConsoleTransport()
});

logger.info(`base type:`, 'string', 233, null, undefined, true, false, 2.7182818284);
logger.fatal(`normal object (json):`, { value: 1, content: 'content', extends: { value: 2 } }, [
  1,
  null,
  { value: false },
  'string'
]);
const obj: any = {};
obj.value = obj;
logger.error(`loop object:`, obj);
logger.warn(`javascript special type:`, Symbol(233), BigInt('1234567891011121314151617181920'));
logger.debug(`javascript object:`, Math, globalThis);
logger.trace(`javascript constructor:`, Object, Function, String, Number, Boolean, Set, Map, Symbol, Error, Date);
logger.label('label1').info(
  `javascript object instance`,
  new Map([
    [1, 3],
    [2, 3],
    [3, 4],
    [4, 5]
  ]),
  new Set([1, 3, 3, 4, 5, 6, 7, 7, 8]),
  new Proxy({}, {}),
  new Error('a error'),
  new Date()
);
function a() {}
class A {}
const b = () => {};
logger
  .label('label father')
  .label('label child')
  .warn(`function and class`, a, A, b, () => {}, new A());
```

![example1](https://pic.imgdb.cn/item/65c229869f345e8d032c998a.png)

## 📒 Reference

- [Kotori Docs](https://kotori.js.org/)
