import { getUuid } from 'kotori-bot';
import os from 'os';

type Code = 500 | 501 | 502;

export function response<T>(code: Code, data?: T) {
  return { code, data };
}
export function getToken() {
  return getUuid().replaceAll('-', '');
}

export function getRamRate() {
  const total = os.totalmem() / (1024 * 3);
  return ((total - os.freemem() / (1024 * 3)) / total) * 100;
}

export function getCpuRate() {
  let rate = 0;
  os.cpus().forEach((key) => {
    const { times } = key;
    const usage = (1 - times.idle / (times.idle + times.user + times.nice + times.sys + times.irq)) * 100;
    rate += usage;
  });
  return rate;
}
