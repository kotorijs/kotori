import type { Context, PackageInfo } from 'kotori-bot';

export function loadInfo(info: PackageInfo, ctx: Context) {
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
	ctx.logger.info(`Copyright © 2023 ${info.author} All rights reserved.`);
}

export default loadInfo;
