import { obj } from '@kotori-bot/tools';
import Adapter from './adapter';
import Api from './api';

export class Core {
	protected static readonly AdapterStack: obj<new (config: obj) => Adapter> = {};

	protected static readonly apiStack: obj<Api[]> = {};
}

export default Core;
