import { obj } from '@kotori-bot/tools';
import { AdapterEntity, BaseDir, GlobalConfigs, GlobalOptions } from './types';
import Api from './api';

export class Core {
	protected readonly adapterStack: obj<AdapterEntity> = {};

	// protected readonly botsStack: obj<Adapter[]> = {};

	protected readonly apiStack: obj<Api[]> = {};

	public readonly baseDir: BaseDir;

	public readonly configs: GlobalConfigs;

	public readonly options: GlobalOptions;

	public constructor(baseDir: BaseDir, configs: GlobalConfigs, env: GlobalOptions['node_env']) {
		/* question of there some var kill them... */
		this.baseDir = baseDir;
		this.configs = configs;
		this.options = {
			node_env: env,
		};
	}
}

export default Core;
