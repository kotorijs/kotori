import { resolve } from 'node:path'
import { DEV_MODE, Logger } from '@kotori-bot/loader'
import { existsSync } from 'node:fs'
import { executeCommand } from '@kotori-bot/core'

function daemon(virtualEnv: Record<string, string | undefined>) {
  const startTime = new Date().getTime()
  const isDev = virtualEnv.ROMI_MODE === DEV_MODE
  Logger.info('[Daemon] Starting...')
  const isSource = existsSync(resolve(__dirname, 'cli.ts'))

  const child = executeCommand(
    isDev || isSource
      ? `tsx "${resolve(__dirname, isSource ? 'cli.ts' : 'cli.js')}"`
      : `node "${resolve(__dirname, 'cli.js')}"`,
    { cwd: process.cwd(), env: virtualEnv },
    (err, stdout, stderr) => {
      if (err && isDev) Logger.error('[Daemon] Child process error: ', err)
      if (stdout) process.stdout.write(stdout)
      if (stderr) process.stderr.write(stderr)
    }
  )

  child.on('exit', (code) => {
    if (code === 0) return
    const endTime = new Date().getTime()
    const timeTaken = (endTime - startTime) / 1000
    Logger.error(`[Daemon] Exited with code ${code} in ${timeTaken} seconds.`)
    if (timeTaken <= 5) return
    Logger.error('[Daemon] Restarting...')
    daemon(virtualEnv)
  })

  process.stdin.on('data', (...args) => child.stdin?.emit('data', ...args))
}

export default daemon
