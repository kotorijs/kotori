import { getUuid } from 'kotori-bot';
import os from 'os';

export function generateToken() {
  return getUuid().replaceAll('-', '');
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

export function generateMessage(type: string, data: object) {
  return JSON.stringify({ type, data });
}

export function getDate() {
  return `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDay()}`;
}
