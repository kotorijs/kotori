import consoleS from './class/class.logger';
import { getPackageInfo } from './function';

export * from './function';
export * from './type';
export * from './class';

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
	consoleS.info(console.info, `Kotori Bot Version: ${info.version} License: ${info.license}`);
	consoleS.info(console.info, `Kotori Bot By Hotaru`);
	consoleS.info(console.info, `Copyright © 2023 Hotaru All rights reserved.`);
})();
