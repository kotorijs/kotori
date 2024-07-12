import { resolve } from 'node:path'
import { exec } from 'node:child_process'
import { Logger } from '@kotori-bot/loader'
import { existsSync } from 'node:fs'

function dameon(isDev: boolean = false) {
  const startTime = new Date().getTime()
  const child = exec(
    isDev
      ? `tsx ${resolve(__dirname, `./start/dev.${existsSync(resolve(__dirname, './start/dev.ts')) ? 'ts' : 'js'}`)}`
      : `node ${resolve(__dirname, './index.js')}`,
    {},
    (err, stdout, stderr) => {
      if (err) Logger.error('[Dameon]', err)
      if (stdout) process.stdout.write(stdout)
      if (stderr) process.stderr.write(stderr)
    }
  )
  child.on('exit', (code) => {
    if (code === 0) return
    const endTime = new Date().getTime()
    const timeTaken = (endTime - startTime) / 1000
    Logger.error(`[Dameon] Exited with code ${code} in ${timeTaken} seconds.`)
    if (timeTaken <= 5) return
    Logger.error('[Dameon] Restarting...')
    dameon(isDev)
  })
  process.stdin.on('data', (...args) => child.stdin?.emit('data', ...args))
}

export default dameon
