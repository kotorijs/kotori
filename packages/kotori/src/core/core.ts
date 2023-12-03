import { loadConfig, obj } from '@kotori-bot/tools';
import path from 'path';
import { Parser } from 'tsukiko';
import {
	type AdapterConstructor,
	type BaseDir,
	type GlobalConfig,
	type GlobalOptions,
	type KotoriConfig,
	type PackageInfo,
	packageInfoSchema,
	kotoriConfigSchema,
} from '../types';
import type Api from '../components/api';
import { CoreError } from '../utils/errror';

export const defaultConfig = {
	baseDir: {
		root: path.resolve('./'),
		modules: path.resolve('./modules/'),
	},
	config: {
		global: {
			lang: 'en_US',
			'command-prefix': '/',
		},
		adapter: {},
	},
	options: {
		nodeEnv: 'dev',
	},
};

export class Core {
	protected readonly adapterStack: obj<[AdapterConstructor, Parser<unknown>?]> = {};

	protected readonly botStack: obj<Api[]> = {};

	public readonly baseDir: BaseDir;

	public readonly config: GlobalConfig;

	public readonly options: GlobalOptions;

	public readonly package: PackageInfo;

	public constructor(config?: KotoriConfig) {
		const info = loadConfig(path.join(__dirname, '../../package.json')) as unknown;
		if (!info || Object.values(info).length === 0) throw new CoreError('Cannot find kotori-bot package.json');
		if (!packageInfoSchema.check(info)) throw new CoreError('File package.json format error');
		this.package = info;
		const handle = kotoriConfigSchema.parseSafe(config);
		if (!handle.value) throw new CoreError('Unexpected error in parsing config (basedir,kotori,options)');
		this.baseDir = handle.data!.baseDir;
		this.config = handle.data!.config;
		this.options = handle.data!.options;
	}
}

export default Core;
