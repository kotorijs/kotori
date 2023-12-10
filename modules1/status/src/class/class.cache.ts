import { obj } from '@/tools';

export class Cache {
	private static cache: obj = {};

	public static set(key: string, data: obj) {
		this.cache[key] = data;
	}

	public static get = (key: string): obj | null => {
		const result = this.cache[key];
		return result;
	};
}

export default Cache;
