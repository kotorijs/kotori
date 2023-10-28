import Kotori, { getPackageInfo } from 'kotori-bot';

(() => {
	console.info('Kotori Bot is loading...');
	console.info(`
██╗  ██╗ ██████╗ ████████╗ ██████╗ ██████╗ ██╗
██║ ██╔╝██╔═══██╗╚══██╔══╝██╔═══██╗██╔══██╗██║
█████╔╝ ██║   ██║   ██║   ██║   ██║██████╔╝██║
██╔═██╗ ██║   ██║   ██║   ██║   ██║██╔══██╗██║
██║  ██╗╚██████╔╝   ██║   ╚██████╔╝██║  ██║██║
╚═╝  ╚═╝ ╚═════╝    ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚═╝
`);
	const info = getPackageInfo();
	Kotori.logger.info(`Kotori Bot Version: ${info.version} License: ${info.license}`);
	Kotori.logger.info(`Kotori Bot By ${info.author}`);
	Kotori.logger.info(`Copyright © 2023 ${info.author} All rights reserved.`);
})();
