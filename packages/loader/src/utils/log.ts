import type { Context } from '@kotori-bot/core'

export function loadInfo(info: Context['meta'], ctx: Context) {
  if ((ctx.logger as unknown as { options: { level: number } }).options.level >= 70) return
  console.info('Kotori Bot is loading...')
  console.info(`
██╗  ██╗ ██████╗ ████████╗ ██████╗ ██████╗ ██╗
██║ ██╔╝██╔═══██╗╚══██╔══╝██╔═══██╗██╔══██╗██║
█████╔╝ ██║   ██║   ██║   ██║   ██║██████╔╝██║
██╔═██╗ ██║   ██║   ██║   ██║   ██║██╔══██╗██║
██║  ██╗╚██████╔╝   ██║   ╚██████╔╝██║  ██║██║
╚═╝  ╚═╝ ╚═════╝    ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚═╝
`)

  ctx.logger.record('loader base dir:', ctx.baseDir.root)
  ctx.logger.info(
    `Kotori Bot Version: ${info.version} (Core: v${info.coreVersion}, Loader: v${info.loaderVersion}) License: ${info.license}`
  )
  // ctx.logger.info(`Kotori Bot By ${info.author}`)
  ctx.logger.info('Copyright © 2023 - 2025 Arimura Sena All rights reserved')
}

export default loadInfo
