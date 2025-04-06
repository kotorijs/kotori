/*
 * @Author: hotaru biyuehuya@gmail.com
 * @Blog: https://hotaru.icu
 * @Date: 2023-07-11 14:18:27
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2024-02-15 17:21:28
 */
import { type Context, Tsu } from 'kotori-bot'
import os from 'node:os'

function dealTime() {
  const seconds = Math.floor(os.uptime())
  let day: string | number = Math.floor(seconds / (3600 * 24))
  let hours: string | number = Math.floor((seconds - day * 3600 * 24) / 3600)
  let minutes: string | number = Math.floor((seconds - day * 3600 * 24 - hours * 3600) / 60)
  let second: string | number = seconds % 60

  if (day < 10) {
    day = `0${day}`
  }

  if (hours < 10) {
    hours = `0${hours}`
  }

  if (minutes < 10) {
    minutes = `0${minutes}`
  }

  if (second < 10) {
    second = `0${second}`
  }

  return [day, hours, minutes, second].join(':')
}

function dealRam() {
  const total = os.totalmem() / 1024 / 1024 / 1024
  const unused = os.freemem() / 1024 / 1024 / 1024
  const used = total - unused
  const rate = (used / total) * 100
  return {
    total,
    unused,
    used,
    rate
  }
}

function dealCpu() {
  const cpuData = os.cpus()
  let rate = 0
  const ratearr: number[] = []
  for (const key of cpuData) {
    const { times } = key
    const usage = (1 - times.idle / (times.idle + times.user + times.nice + times.sys + times.irq)) * 100
    ratearr.push(usage)
    rate += usage
  }
  return {
    model: cpuData[0].model,
    speed: cpuData[0].speed / 1024,
    num: cpuData.length,
    rate,
    ratearr
  }
}

export const lang = [__dirname, '../locales']

export const config = Tsu.Object({
  template: Tsu.String().default('status.msg.status')
})

type Config = Tsu.infer<typeof config>

export function main(ctx: Context, config: Config) {
  ctx.command('status - status.descr.status').action(() => {
    const { model, speed, num, rate: cpuRate } = dealCpu()
    const { total, used, rate: ramRate } = dealRam()
    return [
      config.template,
      {
        type: os.type(),
        platform: os.platform(),
        arch: os.arch(),
        model,
        speed: speed.toFixed(2),
        num,
        cpu_rate: cpuRate.toFixed(2),
        total: total.toFixed(2),
        used: used.toFixed(2),
        ram_rate: ramRate.toFixed(2),
        network: Object.keys(os.networkInterfaces()).length,
        time: dealTime(),
        hostname: os.hostname(),
        homedir: os.homedir()
      }
    ]
  })
}
