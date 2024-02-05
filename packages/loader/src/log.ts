import type { Context } from '@kotori-bot/core';

export function loadInfo(info: Context['pkg'], ctx: Context) {
  console.info('Kotori Bot is loading...');
  console.info(`
██╗  ██╗ ██████╗ ████████╗ ██████╗ ██████╗ ██╗
██║ ██╔╝██╔═══██╗╚══██╔══╝██╔═══██╗██╔══██╗██║
█████╔╝ ██║   ██║   ██║   ██║   ██║██████╔╝██║
██╔═██╗ ██║   ██║   ██║   ██║   ██║██╔══██╗██║
██║  ██╗╚██████╔╝   ██║   ╚██████╔╝██║  ██║██║
╚═╝  ╚═╝ ╚═════╝    ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚═╝
`);
  ctx.logger.info(`Kotori Bot Version: ${info.version} License: ${info.license}`);
  ctx.logger.info(`Kotori Bot By ${info.author}`);
  ctx.logger.info(`Copyright © 2023 - 2024 ${info.author} All rights reserved`);
}

export default loadInfo;
