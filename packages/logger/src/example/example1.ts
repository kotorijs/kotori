import Logger, { ConsoleTransport, LoggerLevel } from '..';

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
const obj: { value: object } = { value: {} };
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
function a() { }
class A { }
const b = () => { };
logger
  .label('label father')
  .label('label child')
  .warn(`function and class`, a, A, b, () => { }, new A());
