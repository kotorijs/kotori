import { obj } from '@kotori-bot/tools';
import Core from './core';
import { MsgQuickType, MsgType } from './message';
import { eventType } from './events';

export type commandAction = (
	data: { args: commandArgType[]; options: obj<commandArgType> },
	events: eventType['group_msg' | 'private_msg'],
) => MsgQuickType;
export type commandAccess = 'member' | 'manger' | 'admin';
export type commandArgType = string | number;
type commandArgTypeSign = 'string' | 'number';

export interface commandConfig {
	alias?: string[];
	scope?: MsgType | 'all';
	access?: commandAccess;
	help?: string;
	action?: commandAction;
}

export interface ICommandArg {
	name: string;
	type: commandArgTypeSign;
	optional: boolean;
	default: commandArgType;
}

export interface ICommandOption extends ICommandArg {
	realname: string;
	description?: string;
}

export interface ICommandData {
	root: string;
	alias: string[];
	args: ICommandArg[];
	options: ICommandOption[];
	scope: commandConfig['scope'];
	access: commandAccess;
	description?: string;
	help?: string;
	action?: commandAction;
}

const parseTemplateParam = (content: string) => {
	const { '0': prefix, '1': defaultValue } = content.split('=');
	const { '0': argName, '1': argType } = prefix;
	let handleDefaultValue: commandArgType | null = defaultValue || null;
	let handleArgType: commandArgTypeSign = 'string';
	if (argType === 'number') {
		handleArgType = 'number';
		if (handleDefaultValue) handleDefaultValue = parseInt(handleDefaultValue, 10);
	}
	return {
		name: argName || 'content',
		type: handleArgType,
		default: defaultValue,
	};
};

export class Command extends Core {
	public constructor(template: string, config?: commandConfig) {
		super();
		this.template = template;
		this.data = Object.assign(this.data, config);
		Core.commandDataStack.push(this.data);
		this.parseTemplate();
	}

	private template: string;

	public readonly data: ICommandData = {
		root: '',
		alias: [],
		scope: 'all',
		access: 'member',
		args: [],
		options: [],
		description: '',
	};

	private parseTemplate = () => {
		this.template = this.template.trim().replace(/\s{2,}/g, ' ');
		const { '0': commandStr, '1': description } = this.template.split(' - ');
		this.data.description = description;
		const requiredIndex = commandStr.indexOf(' <');
		const optionalIndex = commandStr.indexOf(' [');
		let requiredStr = '';
		let optionalStr = '';
		if (requiredIndex > 0) {
			this.data.root = commandStr.substring(0, requiredIndex);
			requiredStr = commandStr.substring(requiredIndex);
			const newOptionalIndex = requiredStr.indexOf(' [');
			if (newOptionalIndex > 0) {
				optionalStr = requiredStr.substring(newOptionalIndex);
				requiredStr = requiredStr.substring(0, newOptionalIndex);
			}
		} else if (optionalIndex > 0) {
			this.data.root = commandStr.substring(0, optionalIndex);
			optionalStr = commandStr.substring(optionalIndex);
		} else {
			this.data.root = commandStr;
		}

		const handleFunc = (str: string, optional: boolean) => {
			[...str.matchAll(/<(.*?).>/g)].forEach(content => {
				this.data.args.push({ optional, ...parseTemplateParam(content[1]) });
			});
		};

		if (requiredStr) handleFunc(requiredStr, false);
		if (optionalStr) handleFunc(optionalStr, true);
	};

	public readonly alias = (alias: string | string[]) => {
		if (typeof alias === 'string') this.data.alias.push(alias);
		else this.data.alias.push(...alias);
		return this;
	};

	public readonly scope = (scope: commandConfig['scope']) => {
		this.data.scope = scope;
		return this;
	};

	public readonly access = (access: commandAccess) => {
		this.data.access = access;
		return this;
	};

	public readonly option = (name: string, template: string) => {
		const { '0': str, '1': description } = template
			.trim()
			.replace(/\s{2,}/g, ' ')
			.split(' ');

		const index = str.indexOf('=<') > 0 ? str.indexOf('=<') : str.indexOf('=[');
		const realname = index > 0 ? str.substring(0, index) : template;
		this.data.options.push({
			realname,
			description,
			optional: str.indexOf('=<') <= 0,
			...parseTemplateParam(str.substring(index)),
			name,
		});
		return this;
	};

	public readonly action = (callback: commandAction) => {
		this.data.action = callback;
		return this;
	};

	public readonly help = (text: string) => {
		this.data.help = text;
		return this;
	};
}

export default Command;
