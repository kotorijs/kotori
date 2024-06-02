import os from 'node:os';
import { createHash, randomUUID } from 'node:crypto';
import { MsgRecord } from '../types';

export function generateToken() {
  return randomUUID().replaceAll('-', '');
}

export function generateVerifyHash(username: string, password: string, salt: string) {
  return createHash('sha256').update(`${username}${password}${salt}`).digest('hex');
}

export function getRamData() {
  const total = os.totalmem() / 1024 / 1024 / 1024;
  const unused = os.freemem() / 1024 / 1024 / 1024;
  const used = total - unused;
  const rate = (used / total) * 100;
  return { total, unused, used, rate };
}

export function getCpuData() {
  const cpuData = os.cpus();
  let rate = 0;
  let speed = 0;
  cpuData.forEach((value) => {
    const { times, speed: spd } = value;
    rate += (1 - times.idle / (times.idle + times.user + times.nice + times.sys + times.irq)) * 100;
    speed += spd / cpuData.length;
  });
  return { rate, speed };
}

export function generateMessage(type: string, data: object | string) {
  return JSON.stringify(type === 'error' ? { type, message: data } : { type, data });
}

export function getDate() {
  return `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDay()}`;
}

export function calcGrandRecord(data: Record<string, MsgRecord>) {
  return Object.values(data).reduce(
    (acc, cur) => ({
      received: acc.received + cur.received,
      sent: acc.sent + cur.sent
    }),
    { received: 0, sent: 0 }
  );
}
