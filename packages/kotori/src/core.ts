import { isObj, loadConfig, obj } from '@kotori-bot/tools';
import path from 'path';
import { AdapterEntity, BaseDir, GlobalConfigs, GlobalOptions, KotoriConfigs, PackageInfo } from './types';
import Api from './api';
import KotoriError from './errror';

const defaultConfigs: {
	baseDir: BaseDir;
	configs: GlobalConfigs;
	options: GlobalOptions;
} = {
	baseDir: {
		root: path.resolve('./'),
		modules: path.resolve('./modules/'),
	},
	configs: {
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

const setDefaultValue = <T extends object>(value: T, defaultValue: T) => {
	const newValue = value;
	Object.keys(newValue).forEach(key => {
		if (newValue[key as keyof T] !== undefined) return;
		newValue[key as keyof T] = defaultValue[key as keyof T];
	});
	return newValue;
};

export class Core {
	public readonly adapterStack: obj<AdapterEntity> = {};

	public readonly botStack: obj<Api[]> = {};

	public readonly baseDir: BaseDir;

	public readonly configs: GlobalConfigs;

	public readonly options: GlobalOptions;

	public readonly package: PackageInfo;

	public constructor(configs?: KotoriConfigs) {
		const info = loadConfig(path.join(__dirname, '../package.json')) as unknown;
		if (!info || !isObj(info) || !info.author || !info.name || !info.version || !info.license) {
			throw new KotoriError('cannot find kotori-bot package.json or format error', 'CoreError');
		}
		this.package = info as PackageInfo;

		if (!configs) {
			this.baseDir = defaultConfigs.baseDir;
			this.configs = defaultConfigs.configs;
			this.options = defaultConfigs.options!;
			return;
		}
		this.baseDir = configs.baseDir
			? setDefaultValue<BaseDir>(configs.baseDir as BaseDir, defaultConfigs.baseDir!)
			: defaultConfigs.baseDir!;
		this.configs = configs.configs
			? setDefaultValue<GlobalConfigs>(configs.configs as GlobalConfigs, defaultConfigs.configs!)
			: defaultConfigs.configs;
		this.options = configs.options
			? setDefaultValue<GlobalOptions>(configs.options as GlobalOptions, defaultConfigs.options!)
			: defaultConfigs.options;
	}
}

export default Core;
