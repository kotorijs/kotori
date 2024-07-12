import type { Context } from '@kotori-bot/core'

export function loadInfo(info: Context['meta'], ctx: Context) {
  process.stdout.write('Kotori Bot is loading...')
  process.stdout.write(`
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
  ctx.logger.info(`Kotori Bot By ${info.author}`)
  ctx.logger.info(`Copyright © 2023 - 2024 ${info.author} All rights reserved`)
}

export default loadInfo
