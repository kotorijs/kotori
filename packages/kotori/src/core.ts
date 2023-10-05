import { obj } from '@kotori-bot/tools';
import { AdapterType } from './adapter';
import { CONFIG, CONST, GlobalConfig } from './global';
import { ICommandData } from './command';
import Api from './api';

export interface GlobalOptions {
	node_env: 'dev' | 'build';
}

export class Core {
	protected static readonly AdapterStack: obj<AdapterType> = {};

	// protected static readonly botsStack: obj<Adapter[]> = {};

	protected static readonly apiStack: obj<Api[]> = {};

	protected static readonly commandDataStack: ICommandData[] = [];

	public static readonly baseDir = CONST;

	public static config: GlobalConfig = CONFIG;

	public static options: GlobalOptions = { node_env: process.env.node_env === 'dev' ? 'dev' : 'build' };
}

export default Core;
