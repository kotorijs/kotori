import { isObj, obj, stringProcess, stringSplit, stringTemp } from '@kotori-bot/tools';
import {
	EventCallback,
	CommandData,
	CommandAccess,
	CommandArgType,
	CommandConfig,
	CommandResult,
	MessageQuick,
	MessageRaw,
	MessageScope,
	EventDataMsg,
} from './types';
import Modules from './modules';
import Api from './api';
import Command from './command';

type MidwareCallback = (data: EventDataMsg, next: () => void) => MessageQuick;
type RegexpCallback = (match: RegExpMatchArray, data: EventDataMsg) => MessageQuick;

interface MidwareStack {
	extend: string;
	callback: MidwareCallback;
	priority: number;
}

interface CommandStack {
	extend: string;
	data: CommandData;
}

interface RegexpStack {
	extend: string;
	match: RegExp;
	callback: RegexpCallback;
}

const parseCommand = (input: string) => {
	const options: obj<CommandArgType> = {};
	const args: CommandArgType[] = [];

	for (const data of Command.commandDataStack) {
		/* parse root */
		if (!data.action) continue;
		let root = data.root;
		let cmd = input
			.replace(/(\s+)/g, ' ')
			.replace(/("\s?")|('\s?')/g, '')
			.trim();
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
			let val: CommandArgType | undefined = el[3] || undefined;
			for (const option of data.options) {
				if (option.realname !== key) continue;
				if (val !== undefined && val !== '') {
					if (option.type === 'number' && typeof val !== 'number') {
						val = parseInt(val, 10);
						if (Number.isNaN(val)) return CommandResult.OPTION_ERROR;
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
				if (!arg || !isObj(arg)) return CommandResult.MANY_ARG;
				let val: CommandArgType = current.trim();
				if (arg.type === 'number' && typeof val !== 'number') {
					val = parseInt(current, 10);
					if (Number.isNaN(current)) return CommandResult.ARG_ERROR;
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
		if (inQuote || inBackslash) return CommandResult.SYNTAX;
		if (data.args.filter(el => el.optional === false).length > args.length) return CommandResult.FEW_ARG;
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

export class Message extends Modules {
	private readonly midwareStack: MidwareStack[] = [];

	/* two commands data array kill them! */
	private readonly commandStack: CommandStack[] = [];

	private readonly regexpStack: RegexpStack[] = [];

	private readonly handleMessageEvent: EventCallback<'group_msg' | 'private_msg'> = messageData => {
		const quick = (message: MessageQuick) => {
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
		const midwareStack: MidwareStack[] = Object.create(this.midwareStack);
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

	protected registeMessageEvent = () => {
		this.on('group_msg', this.handleMessageEvent);
		this.on('private_msg', this.handleMessageEvent);
		this.on('midwares', async data => {
			const { isPass, messageData, quick } = data;
			if (!isPass) return;

			/* Handle command */
			const params = [messageData.message, messageData.api.adapter.config['command-prefix']];
			if (stringProcess(params[0], params[1])) {
				const commonParams = {
					messageData,
					command: stringSplit(params[0], params[1]),
					scope: messageData.type === 'group_msg' ? 'group' : ('private' as MessageScope),
					access: 'member' /* here need database... */ as CommandAccess,
				};
				let isCancel = false;
				const cancel = () => {
					isCancel = true;
				};
				this.emit({ type: 'before_command', cancel, ...commonParams });
				if (isCancel) return;
				const execute = parseCommand(commonParams.command);
				const isSuccess = execute instanceof Object;
				this.emit({ type: 'command', result: isSuccess ? 0 : execute, ...commonParams, cancel });
				if (isCancel) return;
				quick(
					isSuccess
						? await execute.action({ quick, args: execute.args, options: execute.options }, messageData)
						: execute.toFixed(),
				);
				return;
			}

			/* Handle regexp */
			this.regexpStack.forEach(element => {
				const match = messageData.message.match(element.match);
				if (!match) return;
				quick(element.callback(match, messageData));
			});
		});
		this.on('unload_module', data => {
			if (!data.module) return;
			const superArr = [...this.midwareStack, ...this.commandStack, ...this.regexpStack];
			for (const indexOf of Object.keys(superArr)) {
				const index = parseInt(indexOf, 10);
				const element = superArr[index];
				if (element.extend === data.module.mainPath) delete superArr[index];
			}
		});
	};

	public readonly midware = (callback: MidwareCallback, priority: number = 100) => {
		if (this.midwareStack.filter(Element => Element.callback === callback).length) return false;
		this.midwareStack.push({ callback, priority, extend: this.getModuleCurrent() });
		this.midwareStack.sort((first, second) => first.priority - second.priority);
		return true;
	};

	public readonly command = (template: string, config?: CommandConfig) => {
		const result = new Command(template, config);
		this.commandStack.push({
			extend: this.getModuleCurrent(),
			data: Command.commandDataStack[Command.commandDataStack.length - 1],
		});
		return result;
	};

	public readonly regexp = (match: RegExp, callback: RegexpCallback) => {
		if (this.regexpStack.filter(Element => Element.match === match).length) return false;
		this.regexpStack.push({ extend: this.getModuleCurrent(), match, callback });
		return true;
	};

	public readonly boardcast = (type: MessageScope, message: MessageRaw) => {
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

	public readonly notify = (message: MessageRaw) => {
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
