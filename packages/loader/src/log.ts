import Kotori, { PackageInfo } from 'kotori-bot';

export const loadInfo = (info: PackageInfo) => {
	console.info('Kotori Bot is loading...');
	console.info(`
██╗  ██╗ ██████╗ ████████╗ ██████╗ ██████╗ ██╗
██║ ██╔╝██╔═══██╗╚══██╔══╝██╔═══██╗██╔══██╗██║
█████╔╝ ██║   ██║   ██║   ██║   ██║██████╔╝██║
██╔═██╗ ██║   ██║   ██║   ██║   ██║██╔══██╗██║
██║  ██╗╚██████╔╝   ██║   ╚██████╔╝██║  ██║██║
╚═╝  ╚═╝ ╚═════╝    ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚═╝
`);
	Kotori.logger.info(`Kotori Bot Version: ${info.version} License: ${info.license}`);
	Kotori.logger.info(`Kotori Bot By ${info.author}`);
	Kotori.logger.info(`Copyright © 2023 ${info.author} All rights reserved.`);
};

export default loadInfo;
