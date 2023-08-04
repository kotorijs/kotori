import { _console, getPackageInfo } from './function';

export * from './function';
export * from './interface';

(function () {
    console.info('Kotori Bot is loading...')
    console.info(`
██╗  ██╗ ██████╗ ████████╗ ██████╗ ██████╗ ██╗
██║ ██╔╝██╔═══██╗╚══██╔══╝██╔═══██╗██╔══██╗██║
█████╔╝ ██║   ██║   ██║   ██║   ██║██████╔╝██║
██╔═██╗ ██║   ██║   ██║   ██║   ██║██╔══██╗██║
██║  ██╗╚██████╔╝   ██║   ╚██████╔╝██║  ██║██║
╚═╝  ╚═╝ ╚═════╝    ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚═╝
`)
    const info = getPackageInfo();
    _console.info(console.info, `Kotori Bot Version: ${info.version} License: ${info.license}`);
    _console.info(console.info, `Kotori Bot By Hotaru`);
    _console.info(console.info, `Copyright © 2023 Hotaru All rights reserved.`);
})();