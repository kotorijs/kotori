import pino from 'pino';
import stringify from 'fast-safe-stringify';

const log = pino({
  transport: {
    target: 'pino-pretty'
  }
});
log.info(log);
log.info({ v: { s: 's' }, s: false, c: 111 });
console.log(typeof Error, stringify({ v: { s: 's' }, s: false, c: 111 }), { v: { s: 's' }, s: false, c: 111 });
