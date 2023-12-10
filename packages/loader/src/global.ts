import fs from 'fs';
import path from 'path';
import { BaseDir, CoreError, GlobalConfig, globalConfigSchema, loadConfig } from 'kotori-bot';

export const baseDir: BaseDir = (() => {
	let root = path.resolve(__dirname, '..').replace('loader', 'kotori');
	let count = 0;
	while (!fs.existsSync(path.join(root, 'kotori.yml'))) {
		if (count > 5) throw new CoreError('cannot find kotori-bot global kotori.yml');
		root = path.join(root, '..');
		count += 1;
	}

	return {
		root,
		modules: path.join(root, 'modules'),
	};
})();

export const globalConfig: GlobalConfig = (() => {
	const data = loadConfig(path.join(baseDir.root, 'kotori.yml'), 'yaml');
	const isSchema = globalConfigSchema.parseSafe(data);
	if (!isSchema.value) throw new CoreError('kotori-bot global kotori.yml format error');
	return isSchema.data;
})();
