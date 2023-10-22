import { StringTempArgs, obj, stringProcess, stringTemp } from '@kotori-bot/tools';
import { eventCallback, eventType } from './events';
import Modules from './modules';
import Api from './api';
import Mixed from './mixed';
import Command, { ICommandData, commandArgType, commandConfig } from './command';

export type Msg = string;
export type MsgType = 'private' | 'group';
export type MsgQuickType = void | Msg | [string, StringTempArgs];

type midwareCallback = (data: eventType['group_msg' | 'private_msg'], next: () => void) => MsgQuickType;
type regexpCallback = (match: RegExpMatchArray, data: eventType['group_msg' | 'private_msg']) => MsgQuickType;

interface ImidwareStack {
	extend: string;
	callback: midwareCallback;
	priority: number;
}

interface IcommandStack {
	extend: string;
	data: ICommandData;
}

interface IregexpStack {
	extend: string;
	match: RegExp;
	callback: regexpCallback;
}

export class Message extends Modules {
	private static readonly midwareStack: ImidwareStack[] = [];

	private static readonly commandStack: IcommandStack[] = [];

	private static readonly regexpStack: IregexpStack[] = [];

	private static readonly executeCommand = (input: string) => {
		const options: obj<commandArgType> = {};
		const args: commandArgType[] = [];

		let cmd = `${input.replace(/\s-/, '  -')} `;
		for (const data of this.commandDataStack) {
			if (!stringProcess(cmd, data.root) || !data.action) continue;

			for (const el of [...cmd.matchAll(/\s-(.*?)\s/g)]) {
				cmd = cmd.replace(el[0], ' ');
				const key = el[1][0];
				let val: commandArgType | null = el[1][1] || null;
				for (const option of data.options) {
					if (option.realname !== key) continue;
					if (val) {
						if (option.type === 'string' && !(val as string).toLocaleLowerCase) return 1;
						if (option.type === 'number' && !(val as number).toFixed) return 1;
					} else {
						if (option.optional === false) return 2;
						val = option.default || '';
					}
					options[option.name] = val;
				}
			}
			cmd = cmd.trim().replace(/\s{2,}/g, ' ');

			let current = '';
			let inBackslash = false;
			let inQuote = false;
			for (const char of cmd.split('')) {
				if (inBackslash) {
					inBackslash = false;
					current += char;
					continue;
				}
				if (char === ' ' && !inQuote) {
					args.push(current.trim());
					current = '';
				} else if (char === '"' || char === "'") {
					inQuote = !inQuote;
				} else if (char === '\\') {
					inBackslash = true;
				} else {
					current += char;
				}
			}
			return { action: data.action, args, options };
		}
		return 0;
	};

	protected static readonly handleEvent: eventCallback<'group_msg' | 'private_msg'> = data => {
		const send = (val: string | [string, obj<string>]) => {
			if (typeof val === 'string') {
				data.send(val);
				return;
			}
			data.send(stringTemp(Mixed.locale(val[0], data.api.adapter.config.lang), val[1]));
		};
		const result = (result: MsgQuickType) => {
			if (!result) return;
			send(typeof result === 'string' ? result : stringTemp(result[0], result[1]));
		};

		/* Handle middle wares */
		const midwareStack: ImidwareStack[] = Object.create(this.midwareStack);
		let lastMidwareNum = -1;
		while (midwareStack.length > 0) {
			if (lastMidwareNum === midwareStack.length) return;
			lastMidwareNum = midwareStack.length;
			result(midwareStack[0].callback(data, () => midwareStack.shift()));
		}

		/* Handle command */
		if (stringProcess(data.message, '/')) {
			const execute = this.executeCommand(data.message);
			if (execute instanceof Object) {
				result(execute.action(execute, data));
			} else {
				send(execute.toFixed());
			}
		}

		/* Handle regexp */
		this.regexpStack.forEach(element => {
			const match = data.message.match(element.match);
			if (!match) return;
			result(element.callback(match, data));
		});
	};

	protected static registeMessageEvent() {
		this.addListener('group_msg', this.handleEvent);
		this.addListener('private_msg', this.handleEvent);
		this.addListener('unload_module', data => {
			if (!data.module) return;
			const superArr = [...this.midwareStack, ...this.commandStack, ...this.regexpStack];
			for (const indexOf of Object.keys(superArr)) {
				const index = parseInt(indexOf, 10);
				const element = superArr[index];
				if (element.extend === data.module.mainPath) delete superArr[index];
			}
		});
	}

	public static readonly midware = (callback: midwareCallback, priority: number = 100) => {
		if (this.midwareStack.filter(Element => Element.callback === callback).length) return false;
		this.midwareStack.push({ callback, priority, extend: this.getModuleCurrent() });
		this.midwareStack.sort((first, second) => first.priority - second.priority);
		return true;
	};

	public static readonly command = (template: string, config?: commandConfig) => {
		const result = new Command(template, config);
		this.commandStack.push({
			extend: this.getModuleCurrent(),
			data: this.commandDataStack[this.commandDataStack.length - 1],
		});
		return result;
	};

	public static readonly regexp = (match: RegExp, callback: regexpCallback) => {
		if (this.regexpStack.filter(Element => Element.match === match).length) return false;
		this.regexpStack.push({ extend: this.getModuleCurrent(), match, callback });
		return true;
	};

	public static readonly boardcasst = (type: MsgType, message: Msg) => {
		const send =
			type === 'private'
				? (api: Api) => api.send_private_msg(message, 1)
				: (api: Api) => api.send_group_msg(message, 1);
		Object.values(this.apiStack).forEach(apis => {
			apis.forEach(api => send(api));
		});
	};

	public static readonly notify = (message: Msg) => {
		const mainAdapterIdentity = Object.keys(this.configs.adapter)[0];
		for (const apis of Object.values(this.apiStack)) {
			for (const api of apis) {
				if (api.adapter.identity !== mainAdapterIdentity) continue;
				api.send_private_msg(message, api.adapter.config.master);
			}
		}
	};
}

export default Message;
