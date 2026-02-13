import os from 'node:os'

export function getStatusStats() {
  function getRamData() {
    const total = os.totalmem() / 1024 / 1024 / 1024
    const unused = os.freemem() / 1024 / 1024 / 1024
    const used = total - unused
    const rate = (used / total) * 100
    return { total, unused, used, rate }
  }

  function getCpuData() {
    const cpuData = os.cpus()
    let rate = 0
    let speed = 0
    for (const { times, speed: spd } of cpuData) {
      rate += (1 - times.idle / (times.idle + times.user + times.nice + times.sys + times.irq)) * 10
      speed += spd / cpuData.length
    }
    return { rate, speed }
  }

  return {
    ram: getRamData(),
    cpu: getCpuData()
  }
}
