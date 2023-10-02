import fs from 'fs';
import path from 'path';
import { loadConfig, obj } from '@kotori-bot/tools';

interface ConstGlobal {
	ROOT_PATH: string;
	MODULE_PATH: string;
	DATA_PATH: string;
	LOGS_PATH: string;
}

interface PackageInfo {
	name: string;
	version: string;
	description: string;
	main: string;
	types: string;
	scripts: obj<string>;
	author: string;
	license: string;
	bugs: {
		url: string;
	};
	homepage: string;
	dependencies: obj<string>;
	devDependencies: obj<string>;
}

export const CONST: ConstGlobal = (() => {
	let ROOT_PATH = path.resolve(__dirname, '..');
	let count = 0;
	while (!fs.existsSync(path.join(ROOT_PATH, 'config.yml'))) {
		if (count > 5) throw new Error();
		ROOT_PATH = path.join(ROOT_PATH, '..');
		count += 1;
	}

	return {
		ROOT_PATH,
		MODULE_PATH: path.join(ROOT_PATH, 'module'),
		DATA_PATH: path.join(ROOT_PATH, 'data'),
		LOGS_PATH: path.join(ROOT_PATH, 'logs'),
	};
})();

/* export const OPTIONS = {
	dev: process.argv[2] === 'dev',
}; */

export function getPackageInfo(): PackageInfo {
	return <PackageInfo>loadConfig(path.join(CONST.ROOT_PATH, 'package.json'));
}
