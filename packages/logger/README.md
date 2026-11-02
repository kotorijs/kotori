# @kotori-bot/logger

Here are a simple logger,used mainly in Node.js environment,can record quickly log of application at runtime.

## 🚀 Advantage

- Support output base on level of log,and custom filter function
- Allow custom log handle logic
- Template and format log improve read and parse
- Support label marked origin of log
- Number of transport divide,support any readable stream
- Advanced colors and style (ConsoleTransport)

## 🧩 Usage

> `new Logger(options: LoggerOptions)`

```typescript
interface LoggerOptions {
  level: LoggerLevel;
  filter?: (data: LoggerData) => boolean;;
  label: string[];
  transports: Transport | Transport[];
}
```

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

## 🛠️ Transport

### Pre transports

- IOTransport:
- ConsoleTransport: pretty log input to console
- FileTransport: save log to file system

### Custom transport

Reference source of pre-tansports,here are a simple example:

```typescript
import { LoggerData, Transport } from '@kotori-bot/logger';

interface MyTransportConfig {
  /* ... */
}

export class MyTransport extends Transport<MyTransportConfig> {
  handle(data: LoggerData) {
    /* here are some log handle logic... */
  }

  escaper = (...args: unknown): string => {
    /* if need,you can custom escaper */
    /* finally return a string as key msg of LoggerData */
    /* it's optional */
  };
}

export default MyTransport;
```

## 📒 Reference

- [Kotori Docs](https://kotori.js.org/)
