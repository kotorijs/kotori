import { obj } from '@kotori-bot/tools';
import path from 'path';
import { AdapterEntity, BaseDir, GlobalConfigs, GlobalOptions, KotoriConfigs } from './types';
import Api from './api';

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
	protected readonly adapterStack: obj<AdapterEntity> = {};

	// protected readonly botsStack: obj<Adapter[]> = {};

	public readonly apiStack: obj<Api[]> = {};

	public readonly baseDir: BaseDir;

	public readonly configs: GlobalConfigs;

	public readonly options: GlobalOptions;

	public constructor(configs?: KotoriConfigs) {
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
