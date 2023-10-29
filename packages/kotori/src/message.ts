import { StringTempArgs, isObj, obj, stringProcess, stringSplit, stringTemp } from '@kotori-bot/tools';
import { eventCallback, eventType } from './events';
import Modules from './modules';
import Api from './api';
import Command, { ICommandData, commandAccess, commandArgType, commandConfig } from './command';

export type Msg = string;
export type MsgType = 'private' | 'group';
export type MsgQuickType = void | Msg | [string, StringTempArgs];
export const enum CmdResult {
	SUCCESS,
	OPTION_ERROR,
	ARG_ERROR,
	MANY_ARG,
	FEW_ARG,
	SYNTAX,
}

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

	private static readonly parseCommand = (input: string) => {
		const options: obj<commandArgType> = {};
		const args: commandArgType[] = [];

		for (const data of this.commandDataStack) {
			/* parse root */
			if (!data.action) continue;
			let root = data.root;
			let cmd = input.replace(/(\s+)|("")|('')/g, '').trim();
			if (!stringProcess(input, data.root)) {
				const alias = data.alias.filter(el => stringProcess(input, el));
				if (alias.length <= 0) continue;
				root = alias[0];
			}
			cmd = (input.split(root)[1] ?? '').trim();

			/* parse options */
			for (const el of [...`${cmd} `.matchAll(/\s-([a-z]+)(=(\w+)|)\s?\b/g)]) {
				cmd = cmd.replace(el[0], '');
				const key = el[1];
				let val: commandArgType | undefined = el[3] || undefined;
				for (const option of data.options) {
					if (option.realname !== key) continue;
					if (val !== undefined && val !== '') {
						if (option.type === 'number' && typeof val !== 'number') {
							val = parseInt(val, 10);
							if (Number.isNaN(val)) return CmdResult.OPTION_ERROR;
						}
					}
					val = option.default || '';
					options[option.name] = val;
				}
			}

			/* parse args */
			let current = '';
			let inBackslash = false;
			let inQuote = false;
			for (const char of `${cmd} `.split('')) {
				if (inBackslash) {
					inBackslash = false;
					current += char;
					continue;
				}
				if (char === ' ' && !inQuote) {
					if (!current) continue;
					const arg = data.args[args.length];
					if (!arg || !isObj(arg)) return CmdResult.MANY_ARG;
					let val: commandArgType = current.trim();
					if (arg.type === 'number' && typeof val !== 'number') {
						val = parseInt(current, 10);
						if (Number.isNaN(current)) return CmdResult.ARG_ERROR;
					}
					args.push(val);
					current = '';
				} else if (char === '"' || char === "'") {
					// dont fix it for big and small quote
					inQuote = !inQuote;
				} else if (char === '\\') {
					inBackslash = true;
				} else {
					current += char;
				}
			}
			if (inQuote || inBackslash) return CmdResult.SYNTAX;
			if (data.args.filter(el => el.optional === false).length > args.length) return CmdResult.FEW_ARG;
			if (data.args.length > args.length) {
				let index = args.length;
				while (index < data.args.length) {
					const arg = data.args[index];
					if (arg.default === undefined) break;
					args.push(arg.default);
					index += 1;
				}
			}
			return { action: data.action, args, options };
		}
		return 3; // unknown command
	};

	private static readonly handleMessageEvent: eventCallback<'group_msg' | 'private_msg'> = messageData => {
		const quick = (message: MsgQuickType) => {
			if (!message) return;
			const val =
				typeof message === 'string'
					? messageData.locale(message)
					: stringTemp(messageData.locale(message[0]), message[1]);
			if (!val) return;
			messageData.send(val);
		};
		/* Handle middle wares */
		let isPass = true;
		const midwareStack: ImidwareStack[] = Object.create(this.midwareStack);
		let lastMidwareNum = -1;
		while (midwareStack.length > 0) {
			if (lastMidwareNum === midwareStack.length) {
				isPass = false;
				break;
			}
			lastMidwareNum = midwareStack.length;
			quick(midwareStack[0].callback(messageData, () => midwareStack.shift()));
		}
		this.emit({ type: 'midwares', isPass, messageData, quick });
	};

	protected static registeMessageEvent = () => {
		this.addListener('group_msg', this.handleMessageEvent);
		this.addListener('private_msg', this.handleMessageEvent);
		this.addListener('midwares', async data => {
			const { isPass, messageData, quick } = data;
			if (!isPass) return;

			/* Handle command */
			const params = [messageData.message, messageData.api.adapter.config['command-prefix']];
			if (stringProcess(params[0], params[1])) {
				const commonParams = {
					messageData,
					command: stringSplit(params[0], params[1]),
					scope: messageData.type === 'group_msg' ? 'group' : ('private' as MsgType),
					access: 'member' /* here need database... */ as commandAccess,
				};
				let isCancel = false;
				this.emit({
					type: 'before_command',
					cancel: () => {
						isCancel = true;
					},
					...commonParams,
				});
				if (isCancel) return;
				const execute = this.parseCommand(commonParams.command);
				const isSuccess = execute instanceof Object;
				quick(
					isSuccess
						? await execute.action({ quick, args: execute.args, options: execute.options }, messageData)
						: execute.toFixed(),
				); /* here need locales... */
				this.emit({ type: 'command', result: isSuccess ? 0 : execute, ...commonParams });
				return;
			}

			/* Handle regexp */
			this.regexpStack.forEach(element => {
				const match = messageData.message.match(element.match);
				if (!match) return;
				quick(element.callback(match, messageData));
			});
		});
		this.addListener('unload_module', data => {
			if (!data.module) return;
			const superArr = [...this.midwareStack, ...this.commandStack, ...this.regexpStack];
			for (const indexOf of Object.keys(superArr)) {
				const index = parseInt(indexOf, 10);
				const element = superArr[index];
				if (element.extend === data.module.mainPath) delete superArr[index];
			}
		});
	};

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
		/* this need support of database... */
		Object.values(this.apiStack).forEach(apis => {
			/* feating... */
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
