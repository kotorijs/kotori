import fs from 'fs';
import path from 'path';
import YAML from 'yaml';
import {
	BotConfig,
	ConfigFileType,
	ConstGlobal,
	FuncFetchSuper,
	FuncStringProcessKey,
	FuncStringProcessMode,
	FuncStringProcessStr,
	PackageInfo,
	obj,
} from './interface';

export function loadConfig(
	filename: string,
	type: ConfigFileType = 'json',
	init: object | string = {},
): object | null | string[] | number[] | string {
	const dirname: string = path.dirname(filename);
	if (!fs.existsSync(dirname)) fs.mkdirSync(dirname, { recursive: true });
	if (!fs.existsSync(filename)) fs.writeFileSync(filename, typeof init === 'string' ? init : JSON.stringify(init));

	const data: string = fs.readFileSync(filename).toString();
	try {
		if (type === 'yaml') return YAML.parse(data);
		if (type === 'txt') return data;
		return JSON.parse(data);
	} catch (err) {
		console.error(err);
		return null;
	}
}

export function saveConfig(filename: string, data: object | string, type: ConfigFileType = 'json'): void {
	let content: string = '';
	try {
		if (typeof data === 'object' && type === 'json') content = JSON.stringify(data);
		else if (typeof data === 'object' && type === 'yaml') content = YAML.stringify(data);
		else content = data as string;

		const dirname: string = path.dirname(filename);
		if (!fs.existsSync(dirname)) fs.mkdirSync(dirname, { recursive: true });

		fs.writeFileSync(filename, content);
	} catch (err) {
		console.error(err);
	}
}

export function createConfig(filename: string, data?: object, type: ConfigFileType = 'json'): void {
	let content: string = '';
	try {
		if (!fs.existsSync(filename)) {
			if (type === 'json') content = JSON.stringify(data);
			if (type === 'yaml') content = YAML.stringify(data);
			fs.writeFileSync(filename, content);
		}
	} catch (err) {
		console.error(err);
	}
}

export function stringProcess(
	string: FuncStringProcessStr,
	keyString: FuncStringProcessKey,
	mode: FuncStringProcessMode = 0,
): boolean {
	let str = string;
	let key = keyString;
	if (typeof str === 'number') str = str.toString();
	if (typeof key === 'string' || typeof key === 'number') {
		key = key.toString();
		if (mode === 2) {
			return str === key;
		}
		if (mode === 1) {
			return str.includes(key);
		}
		return str.startsWith(key);
	}
	if (Array.isArray(key)) {
		for (let i = 0; i < key.length; i += 1) {
			let element = key[i];
			if (typeof element === 'string' || typeof element === 'number') {
				element = element.toString();
			}
			if (mode === 2) {
				if (str === element) {
					return true;
				}
			} else if (mode === 1 && str.includes(element)) {
				return true;
			} else if (mode === 0 && str.startsWith(element)) {
				return true;
			}
		}
	}
	return false;
}

export function arrayProcess(
	str: FuncStringProcessStr,
	key: FuncStringProcessKey[],
	mode: FuncStringProcessMode = 0,
): boolean {
	for (let a = 0; a < key.length; a += 1) {
		if (stringProcess(str, key[a], mode)) return true;
	}
	return false;
}

export function stringSplit(str: string, key: string): string {
	const index = str.indexOf(key);
	if (index !== -1) {
		return str.slice(index + key.length);
	}
	return '';
}

export function stringTemp(template: string, args: obj<string | number>) {
	const params = args;
	let templateString = template;
	Object.keys(params).forEach(param => {
		if (typeof params[param] !== 'string' && typeof args[param] !== 'number') params[param] = '';
		if (typeof params[param] !== 'string') params[param] = params[param].toString();
		templateString = templateString.replace(new RegExp(`%${param}%`, 'g'), params[param] as string);
	});
	return templateString;
}

export function parseCommand(cmd: string) {
	let command = cmd.trim();
	command = command.replace(/\s{2,}/g, ' ');

	const args = [];
	let current = '';
	let inQuote = false;

	command.split('').forEach(char => {
		if (char === ' ' && !inQuote) {
			args.push(current.trim());
			current = '';
		} else if (char === '"' || char === "'") {
			inQuote = !inQuote;
		} else {
			current += char;
		}
	});

	args.push(current.trim());

	return args.map(arg => {
		if (arg[0] === '"' || arg[0] === "'") {
			return arg.substring(1, arg.length - 1);
		}
		return arg;
	});
}

export function restCommand(commandArr: string[], indexOf: number = 0) {
	let index = indexOf;
	if (commandArr.length <= index) return commandArr;
	for (index; index >= 0; index -= 1) {
		commandArr.shift();
	}
	return commandArr;
}

export function formatTime(date?: Date | null, format: number = 0) {
	const time = date || new Date();
	let result: string = '';
	if (format === 0) {
		result += `${time.getFullYear().toString().substring(2)}/`;
		result += `${time.getMonth() + 1}/${time.getDate()} `;
		result += `${time.getHours()}:${time.getMinutes()}:${time.getMinutes()}`;
	} else if (format === 1) {
		result += `${time.getFullYear()}-${time.getMonth() + 1}-${time.getDate()}`;
	}
	return result;
}

export function getSpecStr(_template_: string) {
	return _template_.replace(/[xy]/g, _c_ => {
		const r = Math.random() * 16;
		let v;
		if (_c_ === 'x') {
			v = Math.floor(r);
		} else {
			v = (Math.floor(r) % 4) + 8;
		}
		return v.toString(16);
	});
}

export function getUuid(): string {
	return getSpecStr('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx');
}

export function getRandomStr(): string {
	return getSpecStr('xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx');
}

export const fetchParam: FuncFetchSuper = async (url: string, params, init) => {
	console.info(`${init?.method || 'GET'} Request url:${url} params:`, params || 'empty');
	let urlRaw = url;
	if (params) {
		urlRaw += '?';
		Object.keys(params).forEach(key => {
			urlRaw += `${key}=${params[key]}&`;
		});
		urlRaw = urlRaw.substring(0, urlRaw.length - 1);
	}
	return fetch(urlRaw, init);
};

export const fetchJson: FuncFetchSuper<obj> = async (url: string, params, init) => {
	const response = fetchParam(url, params, init)
		.then(async res => {
			const result = res.json();
			console.info('Response type: JSON result:', await result);
			return result;
		})
		.catch(err => {
			console.error(err);
		});
	return response;
};

export const fetchText: FuncFetchSuper<string | void> = async (url: string, params, init) => {
	const response = fetchParam(url, params, init)
		.then(async res => {
			const result = res.text();
			console.info('Response type: TEXT result:', await result);
			return result;
		})
		.catch(err => {
			console.error(err);
		});
	return response;
};

export function createProxy<T extends object>(val: T | (() => T)) {
	return new Proxy({} as T, {
		get: (_target, property) => {
			let value = val;
			if (typeof val === 'function') value = val();
			return value[property as keyof typeof val];
		},
	});
}

export const isObj = (data: unknown): data is obj => data !== null && typeof data === 'object' && !Array.isArray(data);

export const isObjArr = (data: unknown): data is obj[] => Array.isArray(data) && isObj(data[0]);

export const CONST: ConstGlobal = (() => {
	let ROOT_PATH = path.resolve(__dirname, '..');
	if (!fs.existsSync(path.join(ROOT_PATH, 'config.yml'))) ROOT_PATH = path.join(ROOT_PATH, '..');

	return {
		ROOT_PATH,
		PLUGIN_PATH: path.join(ROOT_PATH, 'plugins'),
		CONFIG_PATH: path.join(ROOT_PATH, 'config'),
		DATA_PATH: path.join(ROOT_PATH, 'data'),
		LOGS_PATH: path.join(ROOT_PATH, 'logs'),
		BOT: {
			self_id: 0,
			connect: 0,
			heartbeat: 0,
			status: {
				app_initialized: false,
				app_enabled: false,
				plugins_good: null,
				app_good: false,
				online: false,
				stat: {
					packet_received: 0,
					packet_sent: 0,
					packet_lost: 0,
					message_received: 0,
					message_sent: 0,
					disconnect_times: 0,
					lost_times: 0,
					last_message_time: 0,
				},
			},
		},
	};
})();

export const BOTCONFIG = createProxy(() => loadConfig(path.join(CONST.ROOT_PATH, 'config.yml'), 'yaml') as BotConfig);

export const OPTIONS = {
	dev: process.argv[2] === 'dev',
};

export function getPackageInfo(): PackageInfo {
	return <PackageInfo>loadConfig(path.join(CONST.ROOT_PATH, 'package.json'));
}
